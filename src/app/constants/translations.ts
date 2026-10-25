export const translations = {
  en: {
    skip: "Skip to content",
    bio: "Bio",
    stack: "Stack",
    contact: "Contact",
    langLabel: "中文",
    langAria: "切换到中文",
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    name: "Yuchao Xu",
    pageTitle: "Xu Portfolio",
    pageDescription: "Yuchao Xu is a full-stack developer based in Hangzhou.",

    heroAlt: "Leifeng Pagoda across Hangzhou's West Lake at dusk, framed by willows",
    versionAria: "Version 3, repository",

    city: "Hangzhou",
    roleLine: "A passionate frontend (fullstack) engineer.",
    heroNote: "Currently based in Hangzhou, China.",
    meet: "Meet Yuchao",

    manifesto: "I craft dynamic interfaces with clean, optimized code.",
    manifestoLead:
      "I'm Yuchao Xu, a full-stack developer based in Hangzhou. I build engaging interfaces with current tools, test and deploy what I ship, and like doing that work with a team.",

    bioHeading: "Bio",
    aboutDescription: "A dedicated full-stack developer based in Hangzhou, China.",
    aboutMe1:
      "As a skilled web developer, I specialize in crafting dynamic and engaging interfaces using clean, optimized code and the latest development tools and techniques. I am a team player at heart and thrive on collaborating with cross-functional teams to deliver outstanding web applications. Additionally, I have extensive experience in testing and deploying web projects, ensuring that they are fully functional and meet client specifications. I strongly believe that my greatest strength lies in my professional skills and experience, and I am fully committed to making a significant impact in my work.",
    aboutMe2:
      "I also like sharing content related to the stuff that I have learned over the years in Web Development so it can help other people of the Dev Community.",

    stackKicker: "Stack",
    stackTitle: "Tech stack",

    contactKicker: "Contact",
    contactTitle: "Don't be shy. Hit me up.",
    contactBody:
      "I'm open to job opportunities where I can contribute, learn and grow. If you have a good opportunity that matches my skills and experience then don't hesitate to contact me.",
    location: "Hangzhou, China",
    email: "officialxyc@gmail.com",
    mailAria: "Email officialxyc@gmail.com",
    linkedinAria: "LinkedIn",
    githubAria: "GitHub",
    locationAria: "Hangzhou, China on Google Maps",

    back: "Back to the lake",
    signoff: "A passionate frontend engineer, based in Hangzhou.",
    copyright: "Copyright © 2023. All rights are reserved",
    photoBy: "West Lake photograph by",
    photoLicense: "CC BY-SA 4.0",
    photoNote: "Color and crop adjusted.",
  },
  zh: {
    skip: "跳到正文",
    bio: "关于",
    stack: "技术栈",
    contact: "联系",
    langLabel: "EN",
    langAria: "Switch to English",
    themeToDark: "换成深色",
    themeToLight: "换成浅色",
    name: "徐宇超",
    pageTitle: "Xu Portfolio",
    pageDescription: "你好，我是徐宇超，一名专注的全栈开发工程师，目前在杭州工作 📍",

    heroAlt: "西湖黄昏，雷峰塔，前面是柳树",
    versionAria: "v3，去仓库看看",

    city: "杭州",
    roleLine: "一名前端(全栈)开发工程师",
    heroNote: "目前在杭州工作生活 📍",
    meet: "了解我！",

    manifesto: "我喜欢用干净的代码，做有活力的界面。",
    manifestoLead:
      "你好，我是徐宇超。一名专注的全栈开发工程师，目前在杭州工作 📍",

    bioHeading: "关于",
    aboutDescription: "一名专注的全栈开发工程师，目前在杭州工作 📍",
    aboutMe1:
      "作为一名经验丰富的网页开发工程师，我专注于使用简洁、优化的代码和最新的开发工具及技术来构建动态和吸引人的界面。我是一个真诚的团队合作者，热衷于与跨职能团队合作以提供出色的网络应用。此外，我在网络项目的测试和部署方面拥有丰富的经验，确保它们完全符合客户的规范和要求。我坚信我最大的优势在于我的专业技能和经验，我完全致力于在工作中产生重要影响。",
    aboutMe2:
      "我也喜欢分享这些年在Web开发中学到的知识，希望能帮助到开发社区的其他人。",

    stackKicker: "技术栈",
    stackTitle: "技术栈",

    contactKicker: "联系",
    contactTitle: "和我聊聊吧！👇",
    contactBody:
      "我对能够贡献、学习和成长的工作机会持开放态度。如果你有符合我技能和经验的好机会，请随时与我联系。",
    location: "中国杭州",
    email: "officialxyc@gmail.com",
    mailAria: "邮箱 officialxyc@gmail.com",
    linkedinAria: "LinkedIn",
    githubAria: "GitHub",
    locationAria: "地址，中国杭州",

    back: "回西湖看看",
    signoff: "一名前端(全栈)开发工程师，目前在杭州工作生活 📍",
    copyright: "Copyright © 2023. All rights are reserved",
    photoBy: "西湖照片来自",
    photoLicense: "CC BY-SA 4.0",
    photoNote: "已调整色彩与裁切。",
  },
};

export type SupportedLanguage = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["en"];
