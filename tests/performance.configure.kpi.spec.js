const { By, Builder, until } = require('selenium-webdriver');
const assert = require('assert');
const { Select } = require('selenium-webdriver');

const testcases = [
	{
		description: 'Minimum rating: -1',
		kpi: 'Sales Revenue',
		minimumRating: -1,
		maximumRating: 10,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Minimum rating: 0',
		kpi: 'Sales Revenue',
		minimumRating: 0,
		maximumRating: 10,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Minimum rating: 1',
		kpi: 'Sales Revenue',
		minimumRating: 1,
		maximumRating: 10,
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Minimum rating: 99',
		kpi: 'Sales Revenue',
		minimumRating: 99,
		maximumRating: 100,
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Minimum rating: 100',
		kpi: 'Sales Revenue',
		minimumRating: 100,
		maximumRating: 100,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Minimum rating: 101',
		kpi: 'Sales Revenue',
		minimumRating: 101,
		maximumRating: 100,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Maximum rating: -1',
		kpi: 'Sales Revenue',
		minimumRating: 10,
		maximumRating: -1,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Maximum rating: 0',
		kpi: 'Sales Revenue',
		minimumRating: 0,
		maximumRating: 0,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Maximum rating: 1',
		kpi: 'Sales Revenue',
		minimumRating: 1,
		maximumRating: 1,
		expectedClassName: 'validation-error',
	},
	{
		description: 'Maximum rating: 99',
		kpi: 'Sales Revenue',
		minimumRating: 10,
		maximumRating: 99,
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Maximum rating: 100',
		kpi: 'Sales Revenue',
		minimumRating: 10,
		maximumRating: 100,
		expectedClassName: 'message success fadable',
	},
	{
		description: 'Maximum rating: 101',
		kpi: 'Sales Revenue',
		minimumRating: 10,
		maximumRating: 101,
		expectedClassName: 'validation-error',
	},
];

const webDrivers = ['chrome', 'firefox', 'MicrosoftEdge'];
for (let webDriver of webDrivers) {
	describe(`Performance Configuration KPI for ${webDriver}`, function () {
		let driver;
		this.timeout(100000);
		// Build the web driver
		// TODO: Modify to run on different browser
		before(async function () {
			driver = await new Builder().forBrowser(webDriver).build();
		});

		// Clear the driver
		after(async function () {
			await driver.quit();
		});

		testcases.forEach(function (testcase) {
			it(`Test case: ${testcase.description}`, async function () {
				try {
					// Set time out maximum 20s
					this.timeout(50000);

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

					// Click the configure under performance module
					await driver.findElement(By.id('menu_performance_Configure')).click();

					// Click the KPI insind configure, under the performance module
					await driver.findElement(By.id('menu_performance_searchKpi')).click();

					// Click the add button
					await driver.findElement(By.id('btnAdd')).click();

					// Wait until the add page appears
					await driver.wait(
						until.elementLocated(By.id('PerformanceHeading')),
						10000
					);

					// Fill in the information for the KPI

					// This code to select option dropdown
					const element = await driver
						.findElement(By.css('select option[value="8"]')) // Because the option is Sales Executive
						.click();

					await driver
						.findElement(By.id('defineKpi360_keyPerformanceIndicators'))
						.sendKeys(testcase.kpi);

					await driver
						.findElement(By.id('defineKpi360_minRating'))
						.sendKeys(testcase.minimumRating);

					await driver
						.findElement(By.id('defineKpi360_maxRating'))
						.sendKeys(testcase.maximumRating);

					// Click the add button after filling information
					await driver.findElement(By.id('saveBtn')).click();

					// Find the message element based on the key expectedClassName
					const messageElement = await driver.wait(
						until.elementLocated(By.className(testcase.expectedClassName)),
						5000
					);

					assert(messageElement, 'Test case failed ' + testcase.description);
				} catch (error) {
					if (error.name === 'TimeoutError')
						assert.fail(`Test case failed: ${testcase.description}`);
					else assert.fail(`An error occurs ${error.name}`);
				}
			});
		});
	});
}
