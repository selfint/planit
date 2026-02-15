import{L as a}from"./LandingFeatureCard-0i66H1Iu.js";const l=""+new URL("plan-pic-D2vSxrCM.webp",import.meta.url).href,d={title:"Pages/Landing/LandingFeatureCard"},r={render:()=>{const e=document.createElement("div");return e.className="flex flex-col gap-4",e.appendChild(a({label:"מתכנן סמסטר",title:"תכנון מסודר",description:'ראו את כל הסמסטרים, נק"ז ועומסים במקום אחד.',href:"/plan",linkLabel:"מעבר למתכנן →",mediaSrc:l,mediaAlt:"תצוגת מתכנן"})),e.appendChild(a({label:"קטלוגים",title:"דרישות ברורות",description:"בחירת מסלול והשוואת דרישות בצורה נקייה.",href:"/catalog",linkLabel:"בדיקת קטלוגים →"})),e.appendChild(a()),e},globals:{theme:"light"}},n={render:()=>{const e=document.createElement("div");return e.className="flex flex-col gap-4",e.appendChild(a({label:"קטלוגים",title:"דרישות ברורות",description:"בחירת מסלול והשוואת דרישות בצורה נקייה.",href:"/catalog",linkLabel:"בדיקת קטלוגים →",mediaSrc:l,mediaAlt:"תצוגת קטלוג"})),e.appendChild(a({label:"סמסטרים",title:"מעקב לכל תקופה",description:"תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.",href:"/semester",linkLabel:"מעבר לסמסטר →"})),e.appendChild(a()),e},globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-4';
    wrapper.appendChild(LandingFeatureCard({
      label: 'מתכנן סמסטר',
      title: 'תכנון מסודר',
      description: 'ראו את כל הסמסטרים, נק"ז ועומסים במקום אחד.',
      href: '/plan',
      linkLabel: 'מעבר למתכנן →',
      mediaSrc: planImageUrl,
      mediaAlt: 'תצוגת מתכנן'
    }));
    wrapper.appendChild(LandingFeatureCard({
      label: 'קטלוגים',
      title: 'דרישות ברורות',
      description: 'בחירת מסלול והשוואת דרישות בצורה נקייה.',
      href: '/catalog',
      linkLabel: 'בדיקת קטלוגים →'
    }));
    wrapper.appendChild(LandingFeatureCard());
    return wrapper;
  },
  globals: {
    theme: 'light'
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-4';
    wrapper.appendChild(LandingFeatureCard({
      label: 'קטלוגים',
      title: 'דרישות ברורות',
      description: 'בחירת מסלול והשוואת דרישות בצורה נקייה.',
      href: '/catalog',
      linkLabel: 'בדיקת קטלוגים →',
      mediaSrc: planImageUrl,
      mediaAlt: 'תצוגת קטלוג'
    }));
    wrapper.appendChild(LandingFeatureCard({
      label: 'סמסטרים',
      title: 'מעקב לכל תקופה',
      description: 'תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.',
      href: '/semester',
      linkLabel: 'מעבר לסמסטר →'
    }));
    wrapper.appendChild(LandingFeatureCard());
    return wrapper;
  },
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...n.parameters?.docs?.source}}};const p=["Default","Dark"];export{n as Dark,r as Default,p as __namedExportsOrder,d as default};
