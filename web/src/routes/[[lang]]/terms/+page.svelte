<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import { seoData } from '$lib/config/seo';

  const effectiveDate = new Date().toISOString().split('T')[0];
</script>

<Seo
  title={seoData.routes.terms.title}
  description={seoData.routes.terms.description}
  keywords={seoData.routes.terms.keywords}
/>

<div class="container mx-auto px-6 py-20 max-w-4xl">
  <h1 class="text-3xl md:text-5xl font-bold text-white mb-6">
    Terms of Service
  </h1>
  <p class="text-zinc-400 mb-12">
    Effective date: <span class="text-emerald-400 font-semibold"
      >{effectiveDate}</span
    >
  </p>

  <div class="prose prose-invert prose-lg max-w-none text-zinc-300">
    <p class="lead text-xl text-zinc-200">
      By installing and using the Sidecar browser extension ("Service"), you
      agree to these Terms of Service.
    </p>

    <h2>1. License</h2>
    <p>
      Sidecar is open-source software. You are granted a limited, non-exclusive,
      non-transferable license to use the extension for personal or commercial
      purposes, subject to the terms of the MIT License.
    </p>

    <h2>2. User Responsibilities</h2>
    <p>You are responsible for:</p>
    <ul>
      <li>
        Ensuring your use of the extension complies with OpenAI's Terms of
        Service.
      </li>
      <li>Maintaining the security of your local environment.</li>
      <li>Not using the extension for any illegal or unauthorized purpose.</li>
    </ul>

    <h2>3. Disclaimer of Warranties</h2>
    <p>
      The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
      disclaim all warranties, whether express or implied, including the
      warranties of merchantability, fitness for a particular purpose, and
      non-infringement.
    </p>
    <p>
      We do not guarantee that the extension will function uninterrupted,
      secure, or available at any particular time or location, or that any
      errors or defects will be corrected.
    </p>

    <h2>4. Limitation of Liability</h2>
    <p>
      In no event shall the authors or copyright holders be liable for any
      claim, damages, or other liability, whether in an action of contract,
      tort, or otherwise, arising from, out of, or in connection with the
      software or the use or other dealings in the software.
    </p>

    <h2>5. Changes to Terms</h2>
    <p>
      We reserve the right to modify or replace these Terms at any time. By
      continuing to access or use our Service after those revisions become
      effective, you agree to be bound by the revised terms.
    </p>

    <h2>6. Contact</h2>
    <p>
      For any questions regarding these Terms, please reach out via our <a
        href={seoData.product.social.github}
        class="text-emerald-400 hover:underline">GitHub Issues</a
      > page.
    </p>
  </div>
</div>
