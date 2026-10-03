import { ImageResponse } from 'next/og'

// The picture shown in the preview card when a link to this site is shared on
// Facebook, WhatsApp, Instagram or X. Generated (no uploaded asset to go
// stale) in the site's navy palette; 1200x630 is the size those platforms use.
export const alt = 'City of God Christian Centre — A Place to Belong, Believe, and Become.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: 'white',
          background: 'linear-gradient(135deg, #051215 0%, #0f3942 55%, #175564 100%)',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 8, color: '#2fbee0', textTransform: 'uppercase' }}>
          Newcastle upon Tyne
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          City of God Christian Centre
        </div>
        <div style={{ fontSize: 40, marginTop: 32, color: '#cfe9f0' }}>
          A Place to Belong, Believe, and Become.
        </div>
      </div>
    ),
    { ...size },
  )
}
