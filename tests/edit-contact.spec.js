const { By, Key, until, Builder, Select } = require("selenium-webdriver");
const assert = require("assert");
const fs = require("fs");
const { parse } = require("csv");


async function readCsv() {
  return new Promise((resolve) => {
    const testCases = [];
    fs.createReadStream("./resources/contact.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        let err = row[12];

        if (err == "Error message") {
          testCases.push({
            description: row[0],
            addr1: row[1],
            addr2: row[2],
            city: row[3],
            state: row[4],
            zip: row[5],
            country: row[6],
            homePhone: row[7],
            mobile: row[8],
            workPhone: row[9],
            workEmail: row[10],
            otherEmail: row[11],
           
            classAssert: "validation-error",
          });
        } else if (err == "Accepted") {
          testCases.push({
            description: row[0],
            addr1: row[1],
            addr2: row[2],
            city: row[3],
            state: row[4],
            zip: row[5],
            country: row[6],
            homePhone: row[7],
            mobile: row[8],
            workPhone: row[9],
            workEmail: row[10],
            otherEmail: row[11],
            xPathAssert: '//div[@class="message success fadable"]',
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


it("Begin test", async function(){
  const testCases = await readCsv();

  describe(`OrangeHRM Edit Contact Details`, function () {
    this.timeout(20000);
  
    let driver;
  
    before(async function () {
      driver = await new Builder().forBrowser("MicrosoftEdge").build();
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
          "http://localhost/orangehrm-4.5/symfony/web/index.php/pim/contactDetails/empNumber/1"
        );
  
        await driver.findElement(By.id("btnSave")).click();
  
        const dropdown = await driver.findElement(
          By.id("contact_country")
        );
        const country = new Select(dropdown);
        await country.selectByVisibleText("Viet Nam");
  
        const homePhone = await driver.findElement(By.id("contact_emp_hm_telephone"));
        await homePhone.clear();
        await homePhone.sendKeys(testCase.homePhone);
  
        const mobile = await driver.findElement(By.id("contact_emp_mobile"));
        await mobile.clear();
        await mobile.sendKeys(testCase.mobile);
  
        const workPhone = await driver.findElement(By.id("contact_emp_work_telephone"));
        await workPhone.clear();
        await workPhone.sendKeys(testCase.workPhone);
  
        const workEmail = await driver.findElement(
          By.id("contact_emp_work_email")
        );
        await workEmail.clear();
        await workEmail.sendKeys(testCase.workEmail);
  
        const otherEmail = await driver.findElement(
          By.id("contact_emp_oth_email")
        );
        await otherEmail.clear();
        await otherEmail.sendKeys(testCase.otherEmail);
  
  
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
      });
    });
  });
  
})
