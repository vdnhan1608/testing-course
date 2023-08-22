const { By, Builder, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const { Select } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');

const webDrivers = ['chrome', 'firefox', 'MicrosoftEdge'];
const testcases = [
	{
		description: 'Valid work period start date, end date, due date',
		startDate: '2023-08-02',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Start date with the date greater 31',
		startDate: '2023-08-32',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Start date with the date is 31 for month 2,4,6,9,11',
		startDate: '2023-06-31',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Start date with date is 0',
		startDate: '2023-08-00',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Start date with date 29, month 02, in leap year',
		startDate: '2020-02-29',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Start date with month 13',
		startDate: '2023-13-05',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Start date with month 0',
		startDate: '2023-00-05',
		endDate: '2023-08-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date with the date greater 31',
		startDate: '2023-08-02',
		endDate: '2023-08-32',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date with the date is 31 for month 2,4,6,9,11',
		startDate: '2023-08-02',
		endDate: '2023-09-31',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date with date is 0',
		startDate: '2023-08-02',
		endDate: '2023-08-00',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date with date 29, month 02, in leap year',
		startDate: '2020-02-25',
		endDate: '2020-02-29',
		dueDate: '2023-08-06',
		expectedClassName: 'message success fadable',
	},
	{
		description: 'End date with month 13',
		startDate: '2023-08-05',
		endDate: '2023-13-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date with month 0',
		startDate: '2023-08-05',
		endDate: '2023-00-05',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Due date with the date greater 31',
		startDate: '2023-08-02',
		endDate: '2023-08-05',
		dueDate: '2023-08-32',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Due date with the date is 31 for month 2,4,6,9,11',
		startDate: '2023-08-05',
		endDate: '2023-08-31',
		dueDate: '2023-09-31',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Due date with date is 0',
		startDate: '2023-08-02',
		endDate: '2023-08-05',
		dueDate: '2023-08-00',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Due date with date 29, month 02, in leap year',
		startDate: '2020-02-25',
		endDate: '2020-02-29',
		dueDate: '2020-02-29',
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Due date with month 13',
		startDate: '2023-08-02',
		endDate: '2023-08-05',
		dueDate: '2023-13-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'Due date with month 0',
		startDate: '2023-08-02',
		endDate: '2023-08-05',
		dueDate: '2023-00-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date is before start date',
		startDate: '2023-08-05',
		endDate: '2023-08-03',
		dueDate: '2023-08-06',
		expectedClassName: 'validation-error',
	},
	{
		description: 'End date is before start date',
		startDate: '2023-08-05',
		endDate: '2023-08-06',
		dueDate: '2023-08-03',
		expectedClassName: 'validation-error',
	},
];

for (let webDriver of webDrivers) {
	// This is for web driver chrome
	describe(`Manage Review for ${webDriver}:`, function () {
		let driver;
		this.timeout(100000);
		// Build the web driver
		// TODO: Modify to run on different browser
		before(async function () {
			driver = await new Builder().forBrowser(webDriver).build();
		});

		after(async function () {
			// Delete the created user and clear the driver
			await driver.quit();
		});

		testcases.forEach(async function (testcase) {
			it(`Test case: ${testcase.description}`, async function () {
				try {
					// Set time out maximum 50s
					this.timeout(100000);

					// Navigate driver to the following url
					await driver.get(
						'http://localhost/orangehrm-4.5/symfony/web/index.php/auth/login'
					);

					// Find element to input username: admin & password: Duynhan.1608
					await driver.findElement(By.id('txtUsername')).sendKeys('admin');
					await driver
						.findElement(By.id('txtPassword'))
						.sendKeys('Duynhan.1608');

					// Find login button and click
					await driver.findElement(By.id('btnLogin')).click();

					// Wait until the dashboard is loaded
					await driver.wait(
						until.elementLocated(By.id('Subscriber_link')),
						5000
					);

					// Find and click performance module on menu
					await driver.findElement(By.id('menu__Performance')).click();

					// Click the manage review under performance module
					await driver
						.findElement(By.id('menu_performance_ManageReviews'))
						.click();

					// Click the menu_performance_searchPerformancReview, under the performance module
					await driver
						.findElement(By.id('menu_performance_searchPerformancReview'))
						.click();

					// Click the add button
					await driver.findElement(By.id('btnAdd')).click();

					// Wait until the add page appears
					await driver.wait(
						until.elementLocated(By.id('addPerformanceHeading')),
						10000
					);

					// Fill in the information for reviews

					// This is default employee to test
					const employee = await driver.findElement(
						By.id('saveReview360Form_employee')
					);

					await employee.sendKeys('Vo Duy Nhan');
					await employee.sendKeys(Key.ARROW_DOWN);
					await employee.sendKeys(Key.ENTER);

					// Wait until the supervisor review appear
					const reviewCreationBody = await driver.findElement(
						By.id('reviewCreationBody')
					);

					// The section is visible if employee is correct
					await driver.wait(until.elementIsVisible(reviewCreationBody));

					// This field input is set default to IT Admin
					const supervisor = await driver.findElement(
						By.id('saveReview360Form_supervisorReviewer')
					);
					await driver.wait(until.elementIsVisible(supervisor), 10000);

					// await supervisor.click();
					await supervisor.sendKeys('IT Admin');

					await driver.sleep(2000); // Wait 2 seconds in case
					// the autocomplete pop up

					await supervisor.sendKeys(Key.ARROW_DOWN);
					await supervisor.sendKeys(Key.ENTER);

					// Enter the start date
					const startDate = await driver.findElement(
						By.id('saveReview360Form_workPeriodStartDate')
					);

					await startDate.clear();
					await startDate.sendKeys(testcase.startDate);

					// Enter the end date
					const endDate = await driver.findElement(
						By.id('saveReview360Form_workPeriodEndDate')
					);

					await endDate.clear();
					await endDate.sendKeys(testcase.endDate);

					// Enter the due date
					const dueDate = await driver.findElement(
						By.id('saveReview360Form_dueDate')
					);
					await dueDate.clear();

					await dueDate.sendKeys(testcase.dueDate);

					// Click the save button
					await driver.findElement(By.id('saveBtn')).click();

					// Find the message element based on the key expectedClassName
					const messageElement = await driver.wait(
						until.elementLocated(By.className(testcase.expectedClassName)),
						5000
					);

					assert(messageElement, `Testcase failed: ` + testcase.description);
				} catch (error) {
					if (error.name === 'TimeoutError')
						assert.fail(`Test case failed: ${testcase.description}`);
					else assert.fail(`An error occurs ${error}`);
				}
			});
		});
	});
}
