import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json());

app.post('/submit', async (req, res) => {
  const { username, password, code, lang, slug } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://leetcode.com/accounts/login/');

    await page.type('#id_login', username);
    await page.type('#id_password', password);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto(`https://leetcode.com/problems/${slug}/`);

    await page.waitForSelector('.monaco-editor');

    await page.evaluate((codeText) => {
      const textarea = document.querySelector('.monaco-editor textarea');
      textarea.value = codeText;
      textarea.dispatchEvent(new Event('input'));
    }, code);

    await page.click('button:has-text("Submit")');

    await page.waitForSelector('.status-column');

    await browser.close();

    res.json({ success: true });
  } catch (err) {
    await browser.close();
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

