# Офіційний образ Playwright з Chromium і системними залежностями
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

WORKDIR /app

# Кешуємо установку залежностей
COPY package*.json ./
RUN npm ci || npm i

# Копіюємо решту проекту
COPY . .

# На всяк випадок дотягуємо браузер і системні пакети
RUN npx playwright install --with-deps chromium

# Запускаємо headed через віртуальний екран Xvfb
CMD ["bash","-lc","xvfb-run --auto-servernum --server-args='-screen 0 1920x1080x24' npx playwright test --project=chromium"]
