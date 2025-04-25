addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });

  async function handleRequest(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const formData = await request.formData();
    const token = formData.get('_turnstile');
    const ip = request.headers.get('CF-Connecting-IP');

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=0x4AAAAAABTqv1R_40SpfhCQLTRne9fHxfY&response=${token}&remoteip=${ip}`
    });
    const result = await turnstileResponse.json();

    if (!result.success) {
      return new Response('Turnstile validation failed', { status: 403 });
    }

    const formspreeResponse = await fetch('https://formspree.io/f/xbloljzn', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    return formspreeResponse;
  }