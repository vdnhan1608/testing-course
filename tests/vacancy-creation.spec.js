const { By, Key, until, Builder, Select } = require("selenium-webdriver");
const assert = require("assert");
const fs = require("fs");
const { parse } = require("csv");


async function readCsv() {
  return new Promise((resolve) => {
    const testCases = [];
    fs.createReadStream("./resources/vacancy.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        let err = row[6];

        if (err == "Error message") {
          testCases.push({
            description: row[0],
            jobTitle: row[1] == "" ? null : row[1],
            vacancy: row[2],
            hiringManager: row[3] == "" ? null : row[3],
            numberPositions: row[4],
            classAssert: "validation-error",
          });
        } else if (err == "Accepted") {
          testCases.push({
            description: row[0],
            jobTitle: row[1] == "" ? null : row[1],
            vacancy: row[2],
            hiringManager: row[3] == "" ? null : row[3],
            numberPositions: row[4],
            xPathAssert: '//div[@class="message success fadable"]',
            cleanup: true,
          });
        }

      })
      .on("end", function () {
        console.log("finished");

        resolve(testCases);
      })
      .on("error", function (error) {
        console.log(error.message);
      });
  });
}

async function logIn(driver, loginData) {
  await driver.get(
    "http://localhost/orangehrm-4.5/symfony/web/index.php/auth/login"
  );

  // Find the username and password fields and enter credentials
  await driver.findElement(By.id("txtUsername")).sendKeys(loginData.username);
  await driver.findElement(By.id("txtPassword")).sendKeys(loginData.password);

  // Find the login button and click it
  await driver.findElement(By.id("btnLogin")).sendKeys(Key.RETURN);

  // Wait for the dashboard page to load
  await driver.wait(until.elementLocated(By.id("welcome")), 5000);
}

async function performCleanup(driver, vacancy) {
  // Direct to vacancy
  await driver.get(
    "http://localhost/orangehrm-4.5/symfony/web/index.php/recruitment/viewJobVacancy"
  );

  // Delete Job title
  await driver
    .findElement(
      By.xpath('//tr/td/a[text()="' + vacancy + '"]/../../td[1]/input')
    )
    .click();
  await driver.findElement(By.id("btnDelete")).click();

  await driver.findElement(By.id("dialogDeleteBtn")).click(); // Confirm deletion

  // Wait for the deletion to complete
  await driver.wait(
    until.elementLocated(By.xpath('//div[@class="message success fadable"]')),
    5000
  );
}

it("Begin test", async function () {
  const testCases = await readCsv();
  describe(`OrangeHRM Vacancy Creation`, function () {
    this.timeout(50000);
    let driver;

    before(async function () {
      driver = await new Builder().forBrowser("firefox").build();
      await driver.manage().deleteAllCookies();
      await logIn(driver, { username: "admin", password: "@dminHQB123" });
      // await performCleanup();
    });

    after(async function () {
      // Close the browser after all tests
      await driver.quit();
    });

    testCases.forEach(function (testCase) {
      it(testCase.description, async function () {
        await driver.get(
          "http://localhost/orangehrm-4.5/symfony/web/index.php/recruitment/viewJobVacancy"
        );

        await driver.findElement(By.id("btnAdd")).click();

        if (testCase.jobTitle) {
          const dropdown = await driver.findElement(
            By.id("addJobVacancy_jobTitle")
          );
          const job_title = new Select(dropdown);
          await job_title.selectByVisibleText(testCase.jobTitle);
        }

        const vacancyName = await driver.findElement(
          By.id("addJobVacancy_name")
        );
        await vacancyName.sendKeys(testCase.vacancy);

        if (testCase.hiringManager) {
          const hiringManager = await driver.findElement(
            By.id("addJobVacancy_hiringManager")
          );

          await hiringManager.sendKeys("Ba");
          await driver.wait(
            until.elementLocated(By.className("ac_results")),
            10000
          );
          await driver
            .findElement(By.xpath('//div[@class="ac_results"]/ul/li[1]'))
            .click();
        }

        const posNum = await driver.findElement(
          By.id("addJobVacancy_noOfPositions")
        );
        await posNum.sendKeys(testCase.numberPositions);

        await driver.findElement(By.id("btnSave")).click();
        // await driver.findElement(By.id("btnBack")).click();
        // Wait for the success message
        await driver.wait(
          until.elementLocated(
            testCase.xPathAssert
              ? By.xpath(testCase.xPathAssert)
              : By.className(testCase.classAssert)
          ),
          10000
        );

        // Assert the success message
        const successMessage = await driver.findElement(
          testCase.xPathAssert
            ? By.xpath(testCase.xPathAssert)
            : By.className(testCase.classAssert)
        );

        assert(successMessage, "Test case failed: " + testCase.description);

        if (testCase.cleanup) {
          await performCleanup(driver, testCase.vacancy);
        }
      });
    });
  });
});
