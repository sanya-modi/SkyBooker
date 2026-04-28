type BoardingPassSource = HTMLElement | HTMLElement[]

function normalizeElements(source: BoardingPassSource): HTMLElement[] {
  const elements = Array.isArray(source) ? source : [source]
  return elements.filter((element): element is HTMLElement => element instanceof HTMLElement)
}

function buildPrintableDocument(title: string, elements: HTMLElement[]) {
  if (typeof document === 'undefined') {
    throw new Error('Boarding pass actions are only available in the browser.')
  }

  if (elements.length === 0) {
    throw new Error('No boarding pass content was found.')
  }

  const styleText = Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('\n')

  const stylesheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n')

  const html = elements
    .map((element) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'boarding-pass-page'
      wrapper.innerHTML = element.outerHTML
      return wrapper.outerHTML
    })
    .join('\n')

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    ${stylesheetLinks}
    <style>
      ${styleText}
      body {
        margin: 0;
        padding: 24px;
        background: #f8fafc;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .boarding-pass-root {
        max-width: 1100px;
        margin: 0 auto;
      }
      .boarding-pass-page + .boarding-pass-page {
        margin-top: 24px;
      }
      @media print {
        body {
          padding: 0;
          background: #ffffff;
        }
        .boarding-pass-page {
          break-after: page;
          page-break-after: always;
        }
        .boarding-pass-page:last-child {
          break-after: auto;
          page-break-after: auto;
        }
      }
    </style>
  </head>
  <body>
    <div class="boarding-pass-root">${html}</div>
  </body>
</html>`
}

function createHiddenFrame(title: string, elements: HTMLElement[]) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', title)
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error('Unable to prepare the boarding pass preview.')
  }

  doc.open()
  doc.write(buildPrintableDocument(title, elements))
  doc.close()

  return iframe
}

function waitForFrameLoad(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve) => {
    const frameWindow = iframe.contentWindow
    if (!frameWindow) {
      resolve()
      return
    }

    const complete = () => resolve()
    if (iframe.contentDocument?.readyState === 'complete') {
      complete()
      return
    }

    iframe.addEventListener('load', () => complete(), { once: true })
    frameWindow.addEventListener('load', () => complete(), { once: true })
    window.setTimeout(complete, 250)
  })
}

function cleanupFrame(iframe: HTMLIFrameElement) {
  window.setTimeout(() => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
  }, 1000)
}

export function openBoardingPassWindow(): null {
  return null
}

export async function printBoardingPassSection(
  title: string,
  source: BoardingPassSource,
  _previewWindow?: Window | null,
): Promise<void> {
  const elements = normalizeElements(source)
  const iframe = createHiddenFrame(title, elements)

  try {
    await waitForFrameLoad(iframe)
    const frameWindow = iframe.contentWindow
    if (!frameWindow) {
      throw new Error('Unable to open the print preview.')
    }

    frameWindow.focus()
    frameWindow.print()
  } finally {
    cleanupFrame(iframe)
  }
}

export async function downloadBoardingPassSection(
  title: string,
  source: BoardingPassSource,
  previewWindow?: Window | null,
): Promise<void> {
  await printBoardingPassSection(title, source, previewWindow)
}
