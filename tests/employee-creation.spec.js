const { By, Key, until, Browser, Builder } = require('selenium-webdriver');
const assert = require('assert');
const { suite } = require('selenium-webdriver/testing');
const path = require('path');

async function performCleanup(driver, employeeId) {
  // Delete the created employee
  await driver.findElement(By.id('menu_pim_viewPimModule')).click();
  await driver.findElement(By.id('menu_pim_viewEmployeeList')).click();

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
      const employeeIdCell = await columns[1];

      // Get the employee ID from the cell's text
      const employeeIdText = await employeeIdCell.getText();

      if (employeeIdText.trim() === employeeId) {
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

const IMAGES = {
  valid: '../resources/images/valid.jpeg',
  invalid: '../resources/images/invalid.bmp',
  largeFile: '../resources/images/pxfuel.jpg',
};

const LONG_TEXT =
  'Senior Product Manager with a very long note that exceeds the maximum allowed characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl. Nulla euismod, nisl quis tincidunt ultricies, nisl nisl aliquet nisl, quis aliquam nisl nisl quis nisl.';

suite(
  function (env) {
    describe(`OrangeHRM Employee Creation - ${env.browser.name}`, function () {
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
            'should verify Employee Creation with Minimum Required Fields',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP001',
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@id="profile-pic"]',
          cleanup: async function () {
            await performCleanup(driver, 'EMP001'); // Pass the employeeId directly
          },
        },
        {
          description:
            'should verify Employee Creation with Complete Information',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            middleName: 'Middle',
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: true,
            userName: 'johndoe',
            password: 'V@ilachinh12312',
            confirmPassword: 'V@ilachinh12312',
            status: 'Enabled',
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@id="profile-pic"]',
          cleanup: async function () {
            await performCleanup(driver, 'EMP001'); // Pass the employeeId directly
          },
        },
        {
          description:
            'should verify Employee Creation with Invalid Photograph Format',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.invalid, // Provide the actual path
            createLogin: false,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message warning fadable"]',
        },
        {
          description:
            'should verify Employee Creation with Large-Sized Photograph',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.largeFile, // Provide the actual path
            createLogin: false,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@class="message warning fadable"]',
        },
        {
          description:
            'should verify Employee Creation with Large-Sized First Name',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: LONG_TEXT,
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: false,
          },
          assertXPath: '//div[@id="profile-pic"]',
          waitUntilAssertXPath: 10000,
          cleanup: async function () {
            await performCleanup(driver, 'EMP001'); // Pass the employeeId directly
          },
        },
        {
          description: 'should verify Employee Creation with empty First Name',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: '',
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: false,
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description:
            'should verify Employee Creation with Large-sized employeeId',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            lastName: 'Doe',
            employeeId: LONG_TEXT,
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: false,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@id="profile-pic"]',
          cleanup: async function () {
            await performCleanup(driver, LONG_TEXT.slice(0, 10)); // Pass the employeeId directly
          },
        },
        {
          description: 'should verify Employee Creation with empty employeeId',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            lastName: 'Doe',
            employeeId: '',
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: false,
          },
          waitUntilAssertXPath: 10000,
          assertXPath: '//div[@id="profile-pic"]',
          cleanup: async function () {
            await performCleanup(driver, ''); // Pass the employeeId directly
          },
        },
        {
          description: 'should verify Employee Creation with Weak Password',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            middleName: 'Middle',
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: true,
            userName: 'johndoe',
            password: 'password123',
            confirmPassword: 'password123',
            status: 'Enabled',
          },
          waitUntilAssertXPath: 10000,
          assertByClass: 'validation-error',
        },
        {
          description: 'should verify Employee Creation with Password Mismatch',
          username: 'admin',
          password: 'V@ilachinh12312',
          employeeDetails: {
            firstName: 'John',
            middleName: 'Middle',
            lastName: 'Doe',
            employeeId: 'EMP001',
            photographPath: IMAGES.valid, // Provide the actual path
            createLogin: true,
            userName: 'johndoe',
            password: 'Pass123!',
            confirmPassword: 'Pass321@',
            status: 'Enabled',
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

          if (testCase.employeeDetails) {
            // Navigate to the Add Employee page
            await driver.findElement(By.id('menu_pim_viewPimModule')).click();
            await driver.findElement(By.id('menu_pim_addEmployee')).click();

            // Fill in employee details
            await driver
              .findElement(By.id('firstName'))
              .sendKeys(testCase.employeeDetails.firstName);
            await driver
              .findElement(By.id('lastName'))
              .sendKeys(testCase.employeeDetails.lastName);
            await driver.findElement(By.id('employeeId')).clear(); // Clear the auto-generated value
            await driver
              .findElement(By.id('employeeId'))
              .sendKeys(testCase.employeeDetails.employeeId);

            if (testCase.employeeDetails.createLogin) {
              // Fill in login details
              await driver.findElement(By.id('chkLogin')).click();
              await driver
                .findElement(By.id('user_name'))
                .sendKeys(testCase.employeeDetails.userName);
              await driver
                .findElement(By.id('user_password'))
                .sendKeys(testCase.employeeDetails.password);
              await driver
                .findElement(By.id('re_password'))
                .sendKeys(testCase.employeeDetails.confirmPassword);
              await driver
                .findElement(By.id('status'))
                .sendKeys(testCase.employeeDetails.status);
            }

            if (testCase.employeeDetails.photographPath) {
              const photographInput = await driver.findElement(
                By.id('photofile')
              );

              await photographInput.sendKeys(
                path.join(__dirname, testCase.employeeDetails.photographPath)
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
