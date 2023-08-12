const { By, Builder, until } = require('selenium-webdriver');
const assert = require('assert');

describe('First script', function () {
	let driver;

	// Before each test case build the driver
	before(async function () {
		driver = await new Builder().forBrowser('chrome').build();
	});

	// After each test case quit the driver
	after(async () => await driver.quit());

	// Test case
	const testcases = [
		{
			description: 'Valid Input',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123-456-789',
			fax: '+1(555)789-1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'message success fadable',
		},
		{
			description: 'Phone value has character letters',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123-abc-789',
			fax: '+1(555)789-1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Phone value has special character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123.456.789',
			fax: '+1(555)789-1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Phone value has space character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123 456 789',
			fax: '+1(555)789-1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Fax value has letters character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)abc-1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Fax value has special character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555).456.1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Fax value has space character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555) 456 1234',
			email: 'admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Email Invalid format structure',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)4561234',
			email: '@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Email that missing domain',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)4561234',
			email: 'admin@.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Email contains leading space character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)4561234',
			email: ' admin@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Email contains multiple @ character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)4561234',
			email: 'ad@min@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Email contains multiple special character',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)4561234',
			email: 'ad!min@gmail.com',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
		{
			description: 'Email with wrong domain',
			organizationName: 'IT DEPARTMENT',
			taxID: '12-3456789',
			registrationNumber: '12345678',
			phoneNumber: '0123456789',
			fax: '+1(555)4561234',
			email: 'admin@gmail.co',
			streetAddress1: '789 Le Loi Avenue',
			streetAddress2: '234 Tran Hung Dao Street',
			city: 'Ho Chi Minh City',
			stateProvince: 'Ho Chi Minh',
			postalCode: '700000',
			country: 'Vietnam',
			expectedClassName: 'validation-error',
		},
	];

	testcases.forEach(function (testcase) {
		it(`Test case: ${testcase.description}`, async function () {
			try {
				this.timeout(20000); // Set time out for test case maximum 20s

				// Navigate the driver to the following url
				await driver.get(
					'http://localhost/orangehrm-4.5/symfony/web/index.php/auth/login'
				);

				// Sign in with username: admin
				// password: Duynhan.1608
				await driver.findElement(By.id('txtUsername')).sendKeys('admin');
				await driver.findElement(By.id('txtPassword')).sendKeys('Duynhan.1608');

				// Find and click the btn login
				await driver.findElement(By.id('btnLogin')).click();

				// Wait until the dashboard is loaded
				await driver.wait(until.elementLocated(By.id('Subscriber_link')), 5000);

				// Click on admin module
				await driver.findElement(By.id('menu_admin_viewAdminModule')).click();

				// Click on menu_admin_organization
				await driver.findElement(By.id('menu_admin_Organization')).click();

				// Navigate to view organization general information
				await driver
					.findElement(By.id('menu_admin_viewOrganizationGeneralInformation'))
					.click();

				// Click on Edit btn
				await driver.findElement(By.id('btnSaveGenInfo')).click();

				// Fill in information;
				await driver.findElement(By.id('organization_name')).clear();
				await driver
					.findElement(By.id('organization_name'))
					.sendKeys(testcase.organizationName);

				await driver.findElement(By.id('organization_taxId')).clear();
				await driver
					.findElement(By.id('organization_taxId'))
					.sendKeys(testcase.taxID);

				await driver
					.findElement(By.id('organization_registraionNumber'))
					.clear();
				await driver
					.findElement(By.id('organization_registraionNumber'))
					.sendKeys(testcase.registrationNumber);

				await driver.findElement(By.id('organization_phone')).clear();
				await driver
					.findElement(By.id('organization_phone'))
					.sendKeys(testcase.phoneNumber);

				await driver.findElement(By.id('organization_fax')).clear();
				await driver
					.findElement(By.id('organization_fax'))
					.sendKeys(testcase.fax); // This cause error that can not save

				await driver.findElement(By.id('organization_email')).clear();
				await driver
					.findElement(By.id('organization_email'))
					.sendKeys(testcase.email);

				await driver.findElement(By.id('organization_street1')).clear();
				await driver
					.findElement(By.id('organization_street1'))
					.sendKeys(testcase.streetAddress1);

				await driver.findElement(By.id('organization_street2')).clear();
				await driver
					.findElement(By.id('organization_street2'))
					.sendKeys(testcase.streetAddress2);

				await driver.findElement(By.id('organization_city')).clear();
				await driver
					.findElement(By.id('organization_city'))
					.sendKeys(testcase.city);

				await driver.findElement(By.id('organization_province')).clear();
				await driver
					.findElement(By.id('organization_province'))
					.sendKeys(testcase.stateProvince);

				await driver.findElement(By.id('organization_zipCode')).clear();
				await driver
					.findElement(By.id('organization_zipCode'))
					.sendKeys(testcase.postalCode);

				// await driver.findElement(By.id('organization_country')).clear();
				// await driver
				// 	.findElement(By.id('organization_country'))
				// 	.sendKeys('Viet Nam');

				// Click the save button
				await driver.findElement(By.id('btnSaveGenInfo')).click(); // Uncomment later

				// Find the message element based on the key expecClassName
				const messageElement = await driver.wait(
					until.elementLocated(By.className(testcase.expectedClassName)),
					10000
				);
			} catch (error) {
				// Here i will throw error if the message i expect not found
				// That means the driver.wait time out.
				if (error.name === 'TimeoutError')
					// Happen when driver.wait timeout
					// because the element not found
					throw new Error(`Fail test case: ${testcase.description}`);
				else throw new Error('An error occur: ', error); // Any wrong syntax this error will be thrown
			}
		});
	});
});
