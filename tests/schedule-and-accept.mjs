import { remote } from 'webdriverio';
import { loadNoahEnv, resolveApkPath } from '../scripts/env.mjs';

async function tapText(driver, text, timeout = 60000) {
  const el = driver.$(`android=new UiSelector().textContains("${text}")`);
  await el.waitForDisplayed({ timeout });
  await el.click();
}

async function waitForText(driver, text, timeout = 60000) {
  const el = driver.$(`android=new UiSelector().textContains("${text}")`);
  await el.waitForDisplayed({ timeout });
}

async function tapTextIfShown(driver, text) {
  const el = driver.$(`android=new UiSelector().textContains("${text}")`);
  if (await el.isDisplayed().catch(() => false)) {
    await el.click();
  }
}

async function signIn(driver, email, password) {
  await tapText(driver, 'Enter email address');
  const emailField = driver.$(`android=new UiSelector().textContains("Enter email address")`);
  await emailField.setValue(email);
  await tapText(driver, 'Please enter your password');
  const passwordField = driver.$(`android=new UiSelector().textContains("Please enter your password")`);
  await passwordField.setValue(password);
  await driver.hideKeyboard().catch(() => {});
  await driver.pressKeyCode(66);
  await tapTextIfShown(driver, 'While using the app');
  await tapTextIfShown(driver, 'Only this time');
  await tapTextIfShown(driver, 'Allow');
}

async function typeInto(driver, label, value) {
  await tapText(driver, label);
  const field = driver.$(`android=new UiSelector().textContains("${label}")`);
  await field.setValue(value);
  await driver.hideKeyboard().catch(() => {});
  const matches = driver.$$(`android=new UiSelector().textContains("${value}")`);
  const items = await matches;
  if (items.length > 1) {
    await items[1].click();
  }
}

export async function runJourney() {
  await loadNoahEnv();
  const clientEmail = process.env.CLIENT_EMAIL;
  const clientPassword = process.env.CLIENT_PASSWORD;
  const driverEmail = process.env.DRIVER_EMAIL;
  const driverPassword = process.env.DRIVER_PASSWORD;
  if (!clientEmail || !clientPassword || !driverEmail || !driverPassword) {
    throw new Error('Set CLIENT_EMAIL, CLIENT_PASSWORD, DRIVER_EMAIL, and DRIVER_PASSWORD in .env.');
  }

  const pickup = process.env.PICKUP_QUERY || 'Main Street';
  const dropoff = process.env.DROPOFF_QUERY || 'City Hospital';

  const browser = await remote({
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4723),
    logLevel: 'error',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:app': resolveApkPath(),
      'appium:appPackage': 'com.noahcares',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:newCommandTimeout': 180,
    },
  });

  try {
    await signIn(browser, clientEmail, clientPassword);
    await tapText(browser, 'Request a Ride');
    await typeInto(browser, 'Pickup', pickup);
    await typeInto(browser, 'Drop', dropoff);
    await tapTextIfShown(browser, 'Select date');
    await tapTextIfShown(browser, 'OK');
    await tapTextIfShown(browser, 'Pickup Time');
    await tapTextIfShown(browser, 'OK');
    await tapTextIfShown(browser, 'Schedule');
    await tapTextIfShown(browser, 'Continue');
    await tapTextIfShown(browser, 'Confirm');
    await waitForText(browser, 'Schedule a Ride created successfully');

    await browser.execute('mobile: clearApp', { appId: 'com.noahcares' });
    await browser.execute('mobile: activateApp', { appId: 'com.noahcares' });

    await signIn(browser, driverEmail, driverPassword);
    await tapTextIfShown(browser, 'My Rides');
    await tapText(browser, 'Accept');
    await tapTextIfShown(browser, 'Are you sure you want to accept this ride?');
    await tapTextIfShown(browser, 'Yes');
    await waitForText(browser, 'Accepted successfully');
  } catch (error) {
    const png = await browser.takeScreenshot().catch(() => null);
    error.screenshot = png;
    throw error;
  } finally {
    await browser.deleteSession();
  }
}
