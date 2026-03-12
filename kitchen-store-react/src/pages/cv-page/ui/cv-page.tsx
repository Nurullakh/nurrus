"use client";

import React from 'react';
import "./cv-page.css";

const CVPage: React.FC = () => (
  <div className="cv-container">
    <header className="cv-header">
      <h1 className="cv-name">Ахмедов Нуруллах</h1>
      <p className="cv-role">Frontend-разработчик</p>
    </header>
    <main className="cv-main">
      <section className="cv-section cv-contact">
        <ul>
          <li>Email: nurullakh.akhmedov@mail.ru</li>
          <li>Phone: +7 (989) 657-75-90</li>
          <li>Telegram: telegram/nurullakh_it</li>
        </ul>
      </section>
      <section className="cv-section cv-skills">
        <h2>Навыки</h2>
        <ul>
          <li>HTML, PUG, TWIG</li>
          <li>CSS, SCSS, PostCSS, BEM</li>
          <li>JavaScript, TypeScript</li>
          <li>Node.js, Python</li>
          <li>React, Redux, Redux Toolkit</li>
          <li>Vue, Vuex, Pinia, Nuxt.js</li>
          <li>Git, GitHub, GitLab</li>
          <li>Gulp, Webpack, Vite, Parcel</li>
          <li>Figma, Sketch</li>
        </ul>
      </section>
      <section className="cv-section cv-experience">
        <h2>Опыт работы</h2>
        <div className="cv-entry">
          <h3>Розничная сеть МТС</h3>
          <span>Август 2024 – март 2025</span>
          <ul>
            <li>Участие в разработке функционала и улучшении пользовательского интерфейса интернет магазина shop.mts.ru</li>
            <li>Разработка с нуля SEO-админку</li>
            <li>Разработка внутренней библиотеки компонентов UI-kit</li>
            <li>Проведение код-ревью</li>
            <li>Написание unit тестов</li>
          </ul>
          <p>Стек: TypeScript, Nuxt.js, Vue, Pinia, Jest, Vite, Docker, Nginx, Nest.js</p>
        </div>
        <div className="cv-entry">
          <h3>Bimi Boo</h3>
          <span>июль 2022 – июль 2024</span>
          <ul>
            <li>Разработка и проектирование архитектуры проектов с нуля</li>
            <li>Создание внутренней библиотеки компонентов UI-kit для улучшения повторного использования кода</li>
            <li>Проведение регулярных код-ревью</li>
          </ul>
          <p>Стек: TypeScript, Vue, Vuex, Pinia, Jest, Feature-Sliced Design</p>
        </div>
        <div className="cv-entry">
          <h3>BSL</h3>
          <span>ноябрь 2021 – ноябрь 2022</span>
          <ul>
            <li>Разработка интерфейсов</li>
            <li>Написание unit тестов</li>
            <li>Улучшение процессов с помощью код-ревью</li>
          </ul>
          <p>Стек: TypeScript, React, Redux Toolkit, Jest</p>
        </div>
        <div className="cv-entry">
          <h3>05.ru</h3>
          <span>октябрь 2019 – ноябрь 2021</span>
          <ul>
            <li>Интернет-магазин 05.ru</li>
            <li>UI Kit</li>
            <li>CRM для рекрутеров</li>
            <li>Создание рассылок на MJML</li>
            <li>Проводил код-ревью и адаптацию новых фронтенд разработчиков</li>
          </ul>
          <p>Стек: JavaScript, Nuxt.js, Vue, Vuex, Cypress</p>
        </div>
      </section>
      <section className="cv-section cv-languages">
        <h2>Знание языков</h2>
        <ul>
          <li>Russian (Native)</li>
          <li>English (B1)</li>
        </ul>
      </section>
    </main>
  </div>
);

export default CVPage; 