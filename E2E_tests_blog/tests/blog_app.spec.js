const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Erkki Esimerkki',
        username: 'Erkki',
        password: 'salainen'
      }
    })
    const usersResponse = await request.get('http://localhost:3003/api/users')
    const users = await usersResponse.json()
    expect(users.length).toBe(1)


    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
  const locator = await page.getByTestId('login-heading')
  await expect(page.getByTestId('login-heading')).toBeVisible({ timeout: 5000 })
})
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
    
    await page.getByRole('textbox').first().fill('Erkki')
    await page.getByRole('textbox').last().fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('Erkki Esimerkki logged in')).toBeVisible()
  })

    test('fails with wrong credentials', async ({ page }) => {
      
    await page.getByRole('textbox').first().fill('erkki')
    await page.getByRole('textbox').last().fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('wrong credentials')).toBeVisible()
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('textbox').first().fill('Erkki')
      await page.getByRole('textbox').last().fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })
  
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes = await page.getByRole('textbox').all()
      
      await textboxes[0].fill('tama on title')
      await textboxes[1].fill('tama author')
      await textboxes[2].fill('tama url')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('a new blog tama on title by tama author added')).toBeVisible() 
    })

    test('blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes = await page.getByRole('textbox').all()
      
      await textboxes[0].fill('tama on title')
      await textboxes[1].fill('tama author')
      await textboxes[2].fill('tama url')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('a new blog tama on title by tama author added')).toBeVisible()
      
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })
  })
})
})