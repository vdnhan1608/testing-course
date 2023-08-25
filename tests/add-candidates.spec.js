const { By, Key, until, Builder, Select } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
const { parse } = require('csv');

async function readCsv() {
  return new Promise((resolve) => {
    const testCases = [];
    fs.createReadStream('./resources/candidate.csv')
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', function (row) {
        let err = row[11];

        if (err == 'Error message') {
          testCases.push({
            description: row[0],
            firstname: row[1],
            middlename: row[2],
            lastname: row[3],
            email: row[4],
            phoneNo: row[5],
            vacancy_title: row[6] == '' ? null : row[6],
            resume: row[7],
            keyword: row[8],
            comment: row[9],
            date: row[10],

            classAssert: 'validation-error',
          });
        } else if (err == 'Accepted') {
          testCases.push({
            description: row[0],
            firstname: row[1],
            middlename: row[2],
            lastname: row[3],
            email: row[4],
            phoneNo: row[5],
            vacancy_title: row[6] == '' ? null : row[6],
            resume: row[7],
            keyword: row[8],
            comment: row[9],
            date: row[10],
            xPathAssert: '//div[@class="message success fadable"]',
            cleanup: true,
          });
        }
      })
      .on('end', function () {
        console.log('finished');
        resolve(testCases);
      })
      .on('error', function (error) {
        console.log(error.message);
      });
  });
}

async function logIn(driver, loginData) {
  await driver.get(
    'http://localhost/orangehrm-4.5/symfony/web/index.php/auth/login'
  );

  // Find the username and password fields and enter credentials
  await driver.findElement(By.id('txtUsername')).sendKeys(loginData.username);
  await driver.findElement(By.id('txtPassword')).sendKeys(loginData.password);

  // Find the login button and click it
  await driver.findElement(By.id('btnLogin')).sendKeys(Key.RETURN);

  // Wait for the dashboard page to load
  await driver.wait(until.elementLocated(By.id('welcome')), 5000);
}

async function performCleanup(driver, candidate) {
  // Direct to vacancy
  await driver.get(
    'http://localhost/orangehrm-4.5/symfony/web/index.php/recruitment/viewCandidates'
  );

  // Delete Job title
  await driver
    .findElement(
      By.xpath('//tr/td/a[text()="' + candidate + '"]/../../td[1]/input')
    )
    .click();
  await driver.findElement(By.id('btnDelete')).click();

  await driver.findElement(By.id('dialogDeleteBtn')).click(); // Confirm deletion

  // Wait for the deletion to complete
  await driver.wait(
    until.elementLocated(By.xpath('//div[@class="message success fadable"]')),
    5000
  );
}

it('Begin test', async function () {
  const testCases = await readCsv();
  describe(`OrangeHRM Adding Candidate to Vacancy`, function () {
    this.timeout(20000);

    let driver;

    before(async function () {
      driver = await new Builder().forBrowser('chrome').build();
      await driver.manage().deleteAllCookies();
      await logIn(driver, { username: 'admin', password: '@dminHQB123' });
      // await performCleanup();
    });

    after(async function () {
      // Close the browser after all tests
      await driver.quit();
    });

    testCases.forEach(function (testCase) {
      it(testCase.description, async function () {
        await driver.get(
          'http://localhost/orangehrm-4.5/symfony/web/index.php/recruitment/viewCandidates'
        );

        await driver.findElement(By.id('btnAdd')).click();

        const firstname = await driver.findElement(
          By.id('addCandidate_firstName')
        );
        await firstname.sendKeys(testCase.firstname);

        const lastname = await driver.findElement(
          By.id('addCandidate_lastName')
        );
        await lastname.sendKeys(testCase.lastname);

        const email = await driver.findElement(By.id('addCandidate_email'));
        await email.sendKeys(testCase.email);

        const phone = await driver.findElement(By.id('addCandidate_contactNo'));
        await phone.sendKeys(testCase.phoneNo);

        if (testCase.job_title) {
          const dropdown = await driver.findElement(
            By.id('addCandidate_vacancy')
          );
          const job_title = new Select(dropdown);
          await job_title.selectByVisibleText(testCase.vacancy_title);
        }

        const date = await driver.findElement(
          By.id('addCandidate_appliedDate')
        );
        await date.clear();
        await date.sendKeys(testCase.date);

        await driver.findElement(By.id('btnSave')).click();

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

        assert(successMessage, 'Test case failed: ' + testCase.description);

        if (testCase.cleanup) {
          await performCleanup(
            driver,
            testCase.firstname +
              ' ' +
              testCase.middlename +
              ' ' +
              testCase.lastname
          );
        }
      });
    });
  });
});
