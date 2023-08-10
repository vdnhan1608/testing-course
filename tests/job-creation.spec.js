const { By, Key, until, Browser, Builder } = require('selenium-webdriver');
const assert = require('assert');
const { suite } = require('selenium-webdriver/testing');
const firefox = require('selenium-webdriver/firefox');
const path = require('path');

async function performCleanup(driver, jobTitle) {
  // Delete the created employee
  await driver.get(
    'http://localhost/orangehrm/symfony/web/index.php/admin/viewJobTitleList'
  );

  // Find the table that contains employee rows
  const tableElement = await driver.findElement(By.id('resultTable'));

  // Find all rows within the table
  const rows = await tableElement.findElements(By.tagName('tr'));

  // Iterate through each row to find the matching employee and checkbox
  for (const row of rows) {
    const columns = await row.findElements(By.tagName('td'));
    if (columns.length >= 2) {
      // Ensure the row has at least 2 columns (checkbox and employee ID)
      const checkbox = await columns[0].findElement(By.tagName('input'));
      const jobTitleCell = await columns[1];

      // Get the employee ID from the cell's text
      const jobTitleText = await jobTitleCell.getText();

      if (jobTitleText.trim() === jobTitle) {
        // Check the checkbox
        await checkbox.click();

        // Click the "Delete" button
        await driver.findElement(By.id('btnDelete')).click();

        // Handle the confirmation dialog
        // await driver.switchTo().alert().accept(); // Confirm deletion
        await driver.findElement(By.id('dialogDeleteBtn')).click(); // Confirm deletion

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

const FILES = {
  valid: '../resources/images/valid.jpeg',
  largeFile: '../resources/images/pxfuel.jpg',
};

suite(
  function (env) {
    describe(`OrangeHRM Job Creation - ${env.browser.name}`, function () {
      let driver;
      before(async function () {
        // Create a new WebDriver instance
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
            'should verify Job Title Creation with Minimum Required Fields',
          username: 'admin',
          password: 'V@ilachinh12312',
          jobTitleDetails: {
            jobTitle: 'Software Developer',
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message success fadable"]',
          cleanup: async function () {
            await performCleanup(driver, 'Software Developer');
          },
        },
        {
          description:
            'should verify Job Title Creation without Required Fields',
          username: 'admin',
          password: 'V@ilachinh12312',
          jobTitleDetails: {
            jobDescription: 'Software Developer Job Description',
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description: 'should verify Job Title Creation with All Fields',
          username: 'admin',
          password: 'V@ilachinh12312',
          jobTitleDetails: {
            jobTitle: 'QA Engineer',
            jobDescription: 'Test software applications',
            jobSpecification: FILES.valid,
            note: 'Important notes about the job',
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message success fadable"]',
          cleanup: async function () {
            await performCleanup(driver, 'QA Engineer');
          },
        },
        {
          description:
            'should fail to create Job Title with invalid job specification',
          username: 'admin',
          password: 'V@ilachinh12312',
          jobTitleDetails: {
            jobTitle: 'Invalid Job Title',
            jobSpecification: FILES.largeFile, // Specify an invalid file
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message warning fadable"]',
          cleanup: null,
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

          if (testCase.jobTitleDetails) {
            // Navigate to the Add Employee page
            // await driver.findElement(By.id('menu_pim_viewPimModule')).click();
            // await driver.findElement(By.id('menu_pim_addEmployee')).click();
            await driver.get(
              'http://localhost/orangehrm/symfony/web/index.php/admin/viewJobTitleList'
            );

            await driver.findElement(By.id('btnAdd')).click();

            // Fill in job title details
            if (testCase.jobTitleDetails.jobTitle) {
              await driver
                .findElement(By.id('jobTitle_jobTitle'))
                .sendKeys(testCase.jobTitleDetails.jobTitle);
            }

            if (testCase.jobTitleDetails.jobDescription) {
              await driver
                .findElement(By.id('jobTitle_jobDescription'))
                .sendKeys(testCase.jobTitleDetails.jobDescription);
            }

            if (testCase.jobTitleDetails.note) {
              await driver
                .findElement(By.id('jobTitle_note'))
                .sendKeys(testCase.jobTitleDetails.note);
            }

            if (testCase.jobTitleDetails.jobSpecification) {
              const photographInput = await driver.findElement(
                By.id('jobTitle_jobSpec')
              );

              await photographInput.sendKeys(
                path.join(__dirname, testCase.jobTitleDetails.jobSpecification)
              );
            }

            // Click Save button
            await driver.findElement(By.id('btnSave')).click();

            // Wait for the success message
            await driver.wait(
              until.elementLocated(
                testCase.assertByClass
                  ? By.className(testCase.assertByClass)
                  : By.xpath(testCase.assertXPath)
              ),
              testCase.waitUntilAssertXPath
            );

            // Assert the success message
            const successMessage = await driver.findElement(
              testCase.assertByClass
                ? By.className(testCase.assertByClass)
                : By.xpath(testCase.assertXPath)
            );

            assert(successMessage, 'Test case failed: ' + testCase.description);
          } else if (testCase.assertElementId) {
            // Assert the presence of the subscriber link
            const subscriber = await driver.findElement(
              By.id(testCase.assertElementId)
            );

            assert(subscriber, 'Test case failed: ' + testCase.description);
          }

          if (testCase.cleanup) {
            await testCase.cleanup();
          }
        });
      });
    });
  },
  { browsers: [Browser.CHROME, Browser.EDGE, Browser.FIREFOX] }
);
