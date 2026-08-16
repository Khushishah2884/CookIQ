import React from 'react';

const Hero = ({ onModuleChange }) => {
  const features = [
    {
      icon: 'restaurant_menu',
      title: 'Intelligent Recipe Generator',
      description:
        'Input what you have, and let our AI craft a precise, step-by-step recipe. It considers flavor pairings, dietary restrictions, and prep time to deliver a personalized culinary blueprint.',
      action: () => onModuleChange('recipe-generator')
    },
    {
      icon: 'grocery',
      title: 'Ingredient Predictor',
      description:
        'Missing an ingredient? Our AI suggests perfect substitutes based on molecular flavor profiles, ensuring your dish never compromises on taste.',
      action: () => onModuleChange('ingredient-predictor')
    },
    {
      icon: 'forum',
      title: 'Sous-Chef Chatbot',
      description: 'Stuck on a step? Ask our realtime culinary assistant for instant advice on techniques, temperature control, or plating.',
      action: () => {} // Chatbot will be handled separately
    }
  ];

  const stats = [
    { number: '10K+', label: 'Recipes' },
    { number: '50K+', label: 'Happy Users' },
    { number: '95%', label: 'Accuracy' },
    { number: '24/7', label: 'AI Support' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-section-gap lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-section-gap items-center">
        <div className="flex flex-col gap-stack-lg z-10">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary px-4 py-1.5 rounded-full w-fit">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              AI-Powered Culinary Platform
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-xl md:text-headline-xl text-on-surface">
            Smart Cooking with <span className="text-primary">CookIQ</span>
          </h1>
          <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg text-on-surface-variant max-w-xl">
            Transform your everyday ingredients into extraordinary meals. Our AI analyzes your pantry, predicts
            flavor profiles, and generates chef-quality recipes in seconds. Stop guessing, start creating.
          </p>
          <div className="flex flex-col sm:flex-row gap-stack-md pt-4">
            <button
              type="button"
              className="bg-primary text-on-primary font-label-lg text-label-lg px-8 py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm hover:scale-[0.98]"
              onClick={() => onModuleChange('recipe-generator')}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                skillet
              </span>
              Start Cooking
            </button>
            <button
              type="button"
              className="bg-surface-container-lowest text-primary border-2 border-primary font-label-lg text-label-lg px-8 py-4 rounded-xl hover:bg-primary-container/5 transition-colors flex items-center justify-center gap-2"
              onClick={() => onModuleChange('ingredient-predictor')}
            >
              <span className="material-symbols-outlined">mindfulness</span>
              Predict Ingredients
            </button>
          </div>
        </div>

        {/* Hero Image / Visual */}
        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden soft-shadow group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBiu1x9GL09GYtNlfriXP3DFtM2Rz0j1pTgTzww9lZDBbrS7ONxpppGRv3wxHFmyp6AE0GyKIlnF08-aKXwLTOt_AqMu28wyBn-WSToLQJRckmV-iTyHk6KTYitExDjVJeb8ujNA5cqHmZsWqUzZh5LeSyUgXF2x4d4yBSEwrAkIzUhuwvlMogNDFdqmSwb78S-lXadskIiAFbsDQA7MYDQGwQx1ws-3R1-6ooRquJPem5WCvGVRhaD0w')"
            }}
          />
          {/* Floating Glass Card */}
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 md:w-80 glass-panel rounded-xl p-4 flex items-center gap-4 border border-white/40">
            <div className="bg-tertiary-container/20 p-3 rounded-full text-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Recipe Generated</p>
              <p className="font-headline-sm text-headline-sm text-on-surface">Seared Salmon Bowl</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-surface-container-low border-y border-outline-variant/20 py-12">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="font-headline-xl text-headline-xl text-primary font-bold">{stat.number}</span>
              <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-section-gap">
        <div className="text-center mb-12">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-4">
            Professional Tools for Home Kitchens
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Discover how CookIQ's suite of intelligent features elevates your culinary workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Main Feature: Recipe Generator */}
          <div
            className="md:col-span-8 bg-surface-container-lowest rounded-2xl overflow-hidden soft-shadow hover-lift flex flex-col relative group border border-outline-variant/10 cursor-pointer"
            onClick={features[0].action}
          >
            <div
              className="h-64 w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDpJ-G5LXYn5lvnl_vRe_39lXhR1NUFJbEK8APVgkGmzg80E1KvaS4gf41N4dRzvwnM-EnNy1feR9TL_2CRy59QvsQexyUBvgnWHvBFtShuzFx1JsiGy2sSbg7SV2cWS1X6cne_OQ5TQV2zsWBTv_WGZAS5MzNB7Ul6fYwee3XWOmW4DEQ74Pvd48IAotUG0jlshFb9H-TTyyOwM2tsSrOxRtgJA4dRuRFqeiI92iiXVkpG3AnD3sO80g')"
              }}
            />
            <div className="p-8 flex flex-col gap-4 flex-grow">
              <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-2xl">{features[0].icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{features[0].title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{features[0].description}</p>
              <span className="mt-auto font-label-lg text-label-lg text-primary flex items-center gap-1 hover:underline underline-offset-4 w-fit">
                Try Generator <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Secondary Feature: Ingredient Predictor */}
          <div
            className="md:col-span-4 bg-surface-container-lowest rounded-2xl overflow-hidden soft-shadow hover-lift flex flex-col p-8 border border-outline-variant/10 cursor-pointer"
            onClick={features[1].action}
          >
            <div className="bg-secondary-container/20 text-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">{features[1].icon}</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{features[1].title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow">
              {features[1].description}
            </p>
            <div className="relative w-full h-40 rounded-xl overflow-hidden mt-auto">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5-a39YZ-bSitxQnLMy9YJ9xmcYMVMuXhqNfJlK1rq0bhS9W_0DY3wW-rCC6qwzSw0-CHsCX5f-QHKJTpKr5FzQax4zAm4DeBxBjgtD9cPKwsbOEokdAKyh3fBAOtMLs1i7PBxyJZAPaPrJQsmOlu-Ca5-LVW6yYjkCOW9WH437l-wcBLJJDDzKjJMx5gao0yVk2orO9jasXJ9N7wq5x7qTMw0_LmfpDuNLBDbSg4pOzMkQ3RLx5JwNA')"
                }}
              />
            </div>
          </div>

          {/* Tertiary Feature: AI Chatbot */}
          <div className="md:col-span-5 bg-surface-container-lowest rounded-2xl overflow-hidden soft-shadow hover-lift flex flex-col p-8 border border-outline-variant/10">
            <div className="bg-tertiary-container/20 text-tertiary w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">{features[2].icon}</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{features[2].title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">{features[2].description}</p>
            <div className="bg-surface rounded-xl p-4 mt-auto border border-outline-variant/20">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">
                User: How do I rescue broken hollandaise?
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                <span className="text-primary font-semibold">CookIQ:</span> Whisk a teaspoon of boiling water or a
                fresh egg yolk into a clean bowl, then slowly stream in the broken sauce while whisking vigorously.
              </p>
            </div>
          </div>

          {/* Feature: Precision Macros (decorative) */}
          <div className="md:col-span-7 bg-primary rounded-2xl overflow-hidden soft-shadow hover-lift flex flex-col sm:flex-row text-on-primary border border-primary-container relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />
            <div className="p-8 flex flex-col justify-center w-full sm:w-1/2 z-10">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">monitor_weight</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-3">Precision Macros</h3>
              <p className="font-body-md text-body-md text-primary-fixed-dim">
                Every generated recipe includes a highly accurate breakdown of macronutrients and caloric density,
                tailored to your exact portion sizes.
              </p>
            </div>
            <div className="w-full sm:w-1/2 p-8 flex items-center justify-center z-10">
              <div className="w-full max-w-xs space-y-4">
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div className="bg-tertiary-fixed h-3 rounded-full w-3/4" />
                </div>
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div className="bg-secondary-fixed-dim h-3 rounded-full w-1/2" />
                </div>
                <div className="w-full bg-black/20 rounded-full h-3">
                  <div className="bg-white h-3 rounded-full w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
