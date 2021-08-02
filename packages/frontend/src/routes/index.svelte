<script>
  import editorScreenshotUrl from "$lib/images/editorscreenshot.webp"
  import readingIllustrationUrl from "$lib/images/readingillustration.webp"
  import platformsImage from "$lib/images/platforms.webp"
  import themingImage from "$lib/images/theming.webp"
  import LandingImage from "$lib/components/LandingImage.svelte"
</script>
<div class="lg:m-16 m-4 text-center lg:flex" id="hero">
  <div class="m-4">
	  <h1 class="text-7xl font-bold">Serenity Editor</h1>
    <h2 class="mt-6 text-2xl italic">The lightest editor you have ever seen</h2>
</div>
  <img src={editorScreenshotUrl} class="rounded-md lg:w-1/2 w-auto m-auto" alt="A screenshot of Serenity Editor"/>
</div>
<div class="flex justify-center gap-5">
  <a class="btn btn-lg" href="/Editor">Try now</a>
  <a class="btn btn-lg btn-outline" href="https://github.com/AsyncBanana/Serenity-Editor">GitHub</a>
</div>
<div>
  <LandingImage src={readingIllustrationUrl} alt="Human peacefully reading next to cat" title="Light and distraction free">Serenity is not just a name. It reflects how Serenity Editor is designed to be minimal but still very useful, letting you write things without a lot of distractions.</LandingImage>
  <LandingImage src={platformsImage} alt="Display of the app on Desktop, Laptops, and mobile" title="Cross platforms">Works on almost any device with a browser, including desktop, mobile, tablets, laptops, and more. Soon, you will even be able to easily sync it across platforms, so you can start something on mobile and continue it on a desktop device, or vice versa.</LandingImage>
  <LandingImage src={themingImage} alt="The app shown in dark and light theme" title="Supports dark and light theme">Serenity will automatically adapt to your theme set in your browser, changing the color scheme based on that.</LandingImage>
</div>
<div class="flex justify-center flex-col">
  <h1 class="text-center text-3xl font-bold mb-10">Ready to start?</h1>
  <a class="btn m-auto mb-20" href="/Editor">Get started</a>
  <a class="link m-auto mb-10" href="/PrivacyPolicy">Privacy Policy</a>
</div>