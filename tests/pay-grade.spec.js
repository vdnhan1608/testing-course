const { By, Key, until, Browser } = require('selenium-webdriver');
const assert = require('assert');
const { suite } = require('selenium-webdriver/testing');

const PAY_GRADE_NAME = 'Grade A';

async function performCleanupCurrency(driver, currencyName) {
  // Find the table that contains currency rows
  const tableElement = await driver.findElement(By.id('tblCurrencies'));

  // Find all rows within the table
  const rows = await tableElement.findElements(By.tagName('tr'));

  // Iterate through each row to find the matching currency and checkbox
  for (const row of rows) {
    const columns = await row.findElements(By.tagName('td'));
    if (columns.length >= 2) {
      // Ensure the row has at least 2 columns (checkbox and currency name)
      const checkbox = await columns[0].findElement(By.tagName('input'));
      const currencyNameCell = await columns[1];

      // Get the currency name from the cell's text
      const currencyNameText = await currencyNameCell.getText();

      if (currencyNameText.trim() === currencyName) {
        // Check the checkbox
        await checkbox.click();

        // Click the "Delete" button
        await driver.findElement(By.id('btnDeleteCurrency')).click();

        // Handle the confirmation dialog
        // await driver.findElement(By.id('dialogDeleteBtn')).click(); // Confirm deletion

        // Wait for the deletion to complete
        await driver.wait(
          until.elementLocated(
            By.xpath('//div[@class="message success fadable"]')
          ),
          5000
        );
        break; // Exit the loop after deletion
      }
    }
  }
}

async function performCleanup(
  driver,
  currencyName,
  payGradeName = PAY_GRADE_NAME
) {
  // Delete the created pay grade
  await driver.get(
    `http://localhost/orangehrm/symfony/web/index.php/admin/viewPayGrades`
  );

  // Find the table that contains pay grade rows
  const tableElement = await driver.findElement(By.id('resultTable'));

  // Find all rows within the table
  const rows = await tableElement.findElements(By.tagName('tr'));

  // Iterate through each row to find the matching pay grade and checkbox
  for (const row of rows) {
    const columns = await row.findElements(By.tagName('td'));
    if (columns.length >= 2) {
      // Ensure the row has at least 2 columns (checkbox and pay grade name)
      const payGradeNameCell = await columns[1];

      // Get the pay grade name from the cell's text
      const payGradeNameText = await payGradeNameCell.getText();

      if (payGradeNameText.trim() === payGradeName) {
        // Click on the pay grade name to navigate to its details
        const paygradeLink = await payGradeNameCell.findElement(
          By.tagName('a')
        );
        await paygradeLink.click();
        await driver.wait(until.elementLocated(By.id('tblCurrencies')), 5000);
        await performCleanupCurrency(driver, currencyName);

        break; // Exit the loop after deletion
      }
    }
  }
}

suite(
  function (env) {
    describe(`OrangeHRM Pay Grade Creation - ${env.browser.name}`, function () {
      let driver;
      before(async function () {
        // Create a new WebDriver instance
        let options = {};
        // check if env is safari
        if (env.browser.name === 'firefox') {
          driver = new Builder().forBrowser('firefox').build();
        } else {
          driver = await env.builder().build();
        }
      });

      after(async function () {
        // Close the browser after all tests
        await driver.quit();
      });

      const testCases = [
        {
          description:
            'should verify Successful Currency Addition to Pay Grade',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VND',
            currenyName: 'Vietnamese Dong',
            minimumSalary: 5000,
            maximumSalary: 10000,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message success fadable"]',
          cleanup: async function (currencyName) {
            await performCleanup(driver, currencyName); // Pass the employeeId directly
          },
        },
        {
          description:
            'should verify Currency Addition with Missing Required Field',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: '',
            currenyName: '',
            minimumSalary: 5000,
            maximumSalary: 10000,
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description:
            'should Verify Currency Addition with Invalid Salary Range',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VND',
            currenyName: 'Vietnamese Dong',
            minimumSalary: 10000,
            maximumSalary: 5000,
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description: 'should verify Set only minimum salary',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VND',
            currenyName: 'Vietnamese Dong',
            minimumSalary: 5000,
            maximumSalary: 0,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message success fadable"]',
          cleanup: async function (currencyName) {
            await performCleanup(driver, currencyName); // Pass the employeeId directly
          },
        },
        {
          description: 'should verify Set only maximum salary',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VND',
            currenyName: 'Vietnamese Dong',
            minimumSalary: 0,
            maximumSalary: 5000,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message success fadable"]',
          cleanup: async function (currencyName) {
            await performCleanup(driver, currencyName); // Pass the employeeId directly
          },
        },
        {
          description: 'should verify Invalid currency',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VNDS',
            currenyName: 'Vietnamese Dong',
            minimumSalary: 0,
            maximumSalary: 5000,
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description: 'should verify Negative salary',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VNDS',
            currenyName: 'Vietnamese Dong',
            minimumSalary: -1000,
            maximumSalary: 0,
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description: 'should verify Salary with special characters',
          username: 'admin',
          password: 'V@ilachinh12312',
          currencyDetails: {
            currency: 'VND',
            currenyName: 'Vietnamese Dong',
            minimumSalary: '#1000',
            maximumSalary: 0,
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
      ];

      testCases.forEach(function (testCase) {
        it(testCase.description, async function () {
          this.timeout(20000);
          // Open the OrangeHRM login page
          await driver.get(
            'http://localhost/orangehrm/symfony/web/index.php/auth/login'
          );

          // Find the username and password fields and enter credentials
          await driver
            .findElement(By.id('txtUsername'))
            .sendKeys(testCase.username);
          await driver
            .findElement(By.id('txtPassword'))
            .sendKeys(testCase.password);

          // Find the login button and click it
          await driver.findElement(By.id('btnLogin')).sendKeys(Key.RETURN);

          // Wait for the dashboard page to load
          await driver.wait(
            until.elementLocated(By.id('Subscriber_link')),
            5000
          );

          await driver.get(
            `http://localhost/orangehrm/symfony/web/index.php/admin/viewPayGrades`
          );
          let run = false;

          if (testCase.currencyDetails) {
            // Find the table that contains pay grade rows
            const tableElement = await driver.findElement(By.id('resultTable'));

            // Find all rows within the table
            const rows = await tableElement.findElements(By.tagName('tr'));

            // Iterate through each row to find the matching pay grade and checkbox
            for (const row of rows) {
              const columns = await row.findElements(By.tagName('td'));
              if (columns.length >= 2) {
                // Ensure the row has at least 2 columns (checkbox and pay grade name)
                const payGradeNameCell = await columns[1];

                // Get the pay grade name from the cell's text
                const payGradeNameText = await payGradeNameCell.getText();

                if (payGradeNameText.trim() === PAY_GRADE_NAME) {
                  // Click on the pay grade name to navigate to its details
                  const paygradeLink = await payGradeNameCell.findElement(
                    By.tagName('a')
                  );
                  await paygradeLink.click();
                  await driver.wait(
                    until.elementLocated(By.id('tblCurrencies')),
                    5000
                  );

                  await driver.findElement(By.id('btnAddCurrency')).click();

                  // Fill in currency details
                  await driver
                    .findElement(By.id('payGradeCurrency_currencyName'))
                    .sendKeys(
                      !testCase.currencyDetails.currency &&
                        !testCase.currencyDetails.currenyName
                        ? ''
                        : testCase.currencyDetails.currency +
                            ' - ' +
                            testCase.currencyDetails.currenyName
                    );
                  await driver
                    .findElement(By.id('payGradeCurrency_minSalary'))
                    .sendKeys(testCase.currencyDetails.minimumSalary);
                  await driver
                    .findElement(By.id('payGradeCurrency_maxSalary'))
                    .sendKeys(testCase.currencyDetails.maximumSalary);

                  // Click Save button
                  await driver.findElement(By.id('btnSaveCurrency')).click();

                  // Wait for the success message
                  await driver.wait(
                    until.elementLocated(
                      testCase.assertByClass
                        ? By.className(testCase.assertByClass)
                        : By.xpath(testCase.assertXPath)
                    ),
                    testCase.waitUntilAssertXPath
                  );

                  // // Assert the success message
                  const successMessage = await driver.findElement(
                    testCase.assertByClass
                      ? By.className(testCase.assertByClass)
                      : By.xpath(testCase.assertXPath)
                  );
                  run = testCase.currencyDetails.currenyName;
                  assert(
                    successMessage,
                    'Test case failed: ' + testCase.description
                  );

                  break; // Exit the loop after deletion
                }
              }
            }
          } else if (testCase.assertElementId) {
            // Assert the presence of the subscriber link
            const subscriber = await driver.findElement(
              By.id(testCase.assertElementId)
            );

            assert(subscriber, 'Test case failed: ' + testCase.description);
          }

          if (testCase.cleanup && run) {
            await testCase.cleanup(run);
          }
        });
      });
    });
  },
  { browsers: [Browser.CHROME] }
);
// , Browser.EDGE, Browser.FIREFOX
