export const translations = {
  en: {
    home: "Home",
    about: "About",
    projects: "Projects",
    contact: "Contact",

    greeting: "Hi, I'm",
    name: "Yuchao Xu",
    role: "A passionate frontend(fullstack) engineer",
    homeLocation: "Currently based in Hangzhou, China. 📍",

    aboutTitle: "ABOUT ME",
    aboutDescription: "A dedicated Full-stack Developer based in Hangzhou, China 📍",
    getToKnowMe: "Get to know me!",
    mySkills: "My Skills",
    aboutMe1:
      "As a skilled web developer, I specialize in crafting dynamic and engaging interfaces using clean, optimized code and the latest development tools and techniques. I am a team player at heart and thrive on collaborating with cross-functional teams to deliver outstanding web applications. Additionally, I have extensive experience in testing and deploying web projects, ensuring that they are fully functional and meet client specifications. I strongly believe that my greatest strength lies in my professional skills and experience, and I am fully committed to making a significant impact in my work.",
    aboutMe2:
      "I also like sharing content related to the stuff that I have learned over the years in Web Development so it can help other people of the Dev Community.",
    aboutMe3:
      "I'm open to Job opportunities where I can contribute, learn and grow. If you have a good opportunity that matches my skills and experience then don't hesitate to contact me.",

    projectsTitle: "Projects",
    projectsSubtitle:
      "Here you will find some of the personal projects that I created",
    liveDemo: "Live Demo",
    sourceCode: "Source Code",
    code: "Code",

    contactTitle: "CONTACT",
    contactText: "Don't be shy! Hit me up! 👇",
    mailTitle: "Mail",
    locationTitle: "Location",
    locationAddress: "Hangzhou, China",
    fullName: "Full Name",
    emailAddress: "Email",
    message: "Message",
    send: "Send",

    techStack: "Tech Stack",
    react: "React",
    nextjs: "NextJs",
    typescript: "TypeScript",
    tailwindcss: "TailwindCSS",
    nodejs: "NodeJs",
    solidity: "Solidity",
    aiIconChoice: "Choose an AI icon",
    aiAssistant: "AI Assistant",
    aiBrain: "AI Brain",
    aiChip: "AI Chip",
  },
  zh: {
    home: "首页",
    about: "关于",
    projects: "项目",
    contact: "联系",

    greeting: "你好，我是",
    name: "徐宇超",
    role: "一名前端(全栈)开发工程师",
    homeLocation: "目前在杭州工作生活 📍",

    aboutTitle: "关于我",
    aboutDescription: "一名专注的全栈开发工程师，目前在杭州工作 📍",
    getToKnowMe: "了解我！",
    mySkills: "我的技能",
    aboutMe1:
      "作为一名经验丰富的网页开发工程师，我专注于使用简洁、优化的代码和最新的开发工具及技术来构建动态和吸引人的界面。我是一个真诚的团队合作者，热衷于与跨职能团队合作以提供出色的网络应用。此外，我在网络项目的测试和部署方面拥有丰富的经验，确保它们完全符合客户的规范和要求。我坚信我最大的优势在于我的专业技能和经验，我完全致力于在工作中产生重要影响。",
    aboutMe2:
      "我也喜欢分享这些年在Web开发中学到的知识，希望能帮助到开发社区的其他人。",
    aboutMe3:
      "我对能够贡献、学习和成长的工作机会持开放态度。如果你有符合我技能和经验的好机会，请随时与我联系。",

    projectsTitle: "项目展示",
    projectsSubtitle: "这里展示了我创建的一些个人项目",
    liveDemo: "演示",
    sourceCode: "源代码",
    code: "源码",

    contactTitle: "联系方式",
    contactText: "和我聊聊吧！👇",
    mailTitle: "邮箱",
    locationTitle: "地址",
    locationAddress: "中国杭州",
    fullName: "姓名",
    emailAddress: "邮箱",
    message: "留言",
    send: "发送",

    techStack: "技术栈",
    react: "React",
    nextjs: "Next.js",
    typescript: "TypeScript",
    tailwindcss: "TailwindCSS",
    nodejs: "Node.js",
    solidity: "Solidity",
    aiIconChoice: "选择一个 AI 图标",
    aiAssistant: "AI 助手",
    aiBrain: "AI 大脑",
    aiChip: "AI 芯片",
  },
};

export type SupportedLanguage = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["en"];
