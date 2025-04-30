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

    test('blog can be removed', async ({ page }) => {
      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes = await page.getByRole('textbox').all()
      
      await textboxes[0].fill('tama on title')
      await textboxes[1].fill('tama author')
      await textboxes[2].fill('tama url')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('a new blog tama on title by tama author added')).toBeVisible()
      
      await page.getByRole('button', { name: 'view' }).click()
      
      page.once('dialog', async ikkuna => {
        expect(ikkuna.type()).toBe('confirm')
        expect(ikkuna.message()).toContain(`Remove tama on title by tama author?`)
        await ikkuna.accept()
      })

      await page.getByRole('button', { name: 'remove' }).click()
      
      const blog = await page.locator('text=tama on title')
      await expect(blog).toHaveCount(0)

    })

    test('Only the creator can see the remove-button', async ({ page, request }) => {
      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes = await page.getByRole('textbox').all()
      
      await textboxes[0].fill('tama on title')
      await textboxes[1].fill('tama author')
      await textboxes[2].fill('tama url')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('a new blog tama on title by tama author added')).toBeVisible()
      
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByRole('button', { name: 'remove' })).toHaveCount(1)

      await page.getByRole('button', { name: 'logout' }).click()

      
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Anna Ampiainen',
          username: 'Anna',
          password: 'salainen'
        }
      })
      await page.getByRole('textbox').first().fill('Anna')
      await page.getByRole('textbox').last().fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      
      await page.getByRole('button', { name: 'view' }).click()

      await expect(page.getByRole('button', { name: 'remove' })).toHaveCount(0)
    })

    test('Blogs in descending like order', async ({ page }) => {
      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes1 = await page.getByRole('textbox').all()
      
      await textboxes1[0].fill('tama on title 1')
      await textboxes1[1].fill('tama author 1')
      await textboxes1[2].fill('tama url 1')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes2 = await page.getByRole('textbox').all()
      
      await textboxes2[0].fill('tama on title 2')
      await textboxes2[1].fill('tama author 2')
      await textboxes2[2].fill('tama url 2')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'new Blog' }).click()
      const textboxes3 = await page.getByRole('textbox').all()
      
      await textboxes3[0].fill('tama on title 3')
      await textboxes3[1].fill('tama author 3')
      await textboxes3[2].fill('tama url 3')
      await page.getByRole('button', { name: 'create' }).click()
      
      let viewNapit = await page.getByRole('button', { name: 'view' }).all()

      await viewNapit[0].click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'hide' }).waitFor()
      await page.getByRole('button', { name: 'hide' }).click()
      
      viewNapit = await page.getByRole('button', { name: 'view' }).all()      
      await viewNapit[1].click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'hide' }).waitFor()
      await page.getByRole('button', { name: 'hide' }).click()

      viewNapit = await page.getByRole('button', { name: 'view' }).all()      
      await viewNapit[2].click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'hide' }).waitFor()
      await page.getByRole('button', { name: 'hide' }).click()

      const blogit = page.locator('.blog')

      await expect(blogit.nth(0)).toHaveText(/tama on title 2 tama author 2/)
      await expect(blogit.nth(1)).toHaveText(/tama on title 1 tama author 1/)
      await expect(blogit.nth(2)).toHaveText(/tama on title 3 tama author 3/)

    })
  })
})
})