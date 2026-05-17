import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flightApi, type PopularDestination } from '../../services/api'

function getCityImage(city: string, iataCode: string): string {
  const cityLower = city.toLowerCase()
  
  // Indian cities with real landmark images
  if (cityLower.includes('delhi') || iataCode === 'DEL') {
    return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop' // India Gate
  } else if (cityLower.includes('mumbai') || iataCode === 'BOM') {
    return 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&h=600&fit=crop' // Gateway of India
  } else if (cityLower.includes('bengaluru') || cityLower.includes('bangalore') || iataCode === 'BLR') {
    return 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop' // Bangalore Palace
  } else if (cityLower.includes('hyderabad') || iataCode === 'HYD') {
    return 'https://media.istockphoto.com/id/1010240892/photo/the-spectacular-char-minar-during-the-blue-hour.jpg?s=2048x2048&w=is&k=20&c=u_TsqZJW9kASPfJ8AO0RB_PuZwYxBrQATw3e1fk-hQE=' // Charminar
  } else if (cityLower.includes('chennai') || iataCode === 'MAA') {
    return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop' // Marina Beach
  } else if (cityLower.includes('kolkata') || cityLower.includes('calcutta') || iataCode === 'CCU') {
    return 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop' // Victoria Memorial
  } else if (cityLower.includes('kochi') || cityLower.includes('cochin') || iataCode === 'COK') {
    return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop' // Kochi Backwaters
  } else if (cityLower.includes('pune') || iataCode === 'PNQ') {
    return 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=600&fit=crop' // Pune City
  } else if (cityLower.includes('ahmedabad') || iataCode === 'AMD') {
    return 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?w=800&h=600&fit=crop' // Ahmedabad cityscape / heritage
  } else if (cityLower.includes('jaipur') || iataCode === 'JAI') {
    return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop' // Hawa Mahal
  } else if (cityLower.includes('goa') || iataCode === 'GOI') {
    return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop' // Goa Beach
  } else {
    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop' // Generic India travel
  }
}

function createDestinationPlaceholder(dest: PopularDestination) {
  const scene = getDestinationScene(dest.destinationName)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${scene.skyStart}" />
          <stop offset="100%" stop-color="${scene.skyEnd}" />
        </linearGradient>
        <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${scene.sunCore}" stop-opacity="0.92" />
          <stop offset="100%" stop-color="${scene.sunGlow}" stop-opacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <circle cx="${scene.sunX}" cy="${scene.sunY}" r="${scene.sunRadius}" fill="url(#glow)" />
      <path d="${scene.horizonBack}" fill="${scene.horizonBackColor}" />
      <path d="${scene.horizonFront}" fill="${scene.horizonFrontColor}" />
      ${scene.water ? `<path d="${scene.water}" fill="${scene.waterColor}" />` : ''}
      ${scene.landmark}
      <rect x="0" y="0" width="1600" height="900" fill="rgba(15,23,42,0.08)" />
      <rect x="76" y="76" width="1448" height="748" rx="44" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <text x="100" y="166" fill="rgba(255,255,255,0.92)" font-size="42" font-family="Inter, Arial, sans-serif" font-weight="700" letter-spacing="10">SKYBOOKER</text>
      <text x="100" y="612" fill="white" font-size="116" font-family="Inter, Arial, sans-serif" font-weight="800">${escapeSvgText(dest.destinationName)}</text>
      <text x="104" y="684" fill="rgba(255,255,255,0.86)" font-size="34" font-family="Inter, Arial, sans-serif" font-weight="600" letter-spacing="12">${escapeSvgText(scene.subtitle)}</text>
      <text x="1294" y="692" fill="rgba(255,255,255,0.95)" font-size="122" font-family="Inter, Arial, sans-serif" font-weight="800">${escapeSvgText(dest.airportCode)}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getDestinationScene(destinationName: string) {
  const key = destinationName.trim().toLowerCase()

  if (key.includes('delhi')) {
    return {
      skyStart: '#f97316',
      skyEnd: '#7c2d12',
      sunCore: '#fde68a',
      sunGlow: '#fb923c',
      sunX: 1220,
      sunY: 210,
      sunRadius: 180,
      horizonBack: 'M0 540C170 500 280 470 420 480C580 492 640 560 780 558C930 556 1010 474 1170 470C1310 466 1450 520 1600 590V900H0Z',
      horizonBackColor: 'rgba(254,215,170,0.25)',
      horizonFront: 'M0 650C130 600 250 590 360 618C470 646 560 714 690 714C860 714 980 582 1130 582C1290 582 1420 650 1600 728V900H0Z',
      horizonFrontColor: '#4a2511',
      water: '',
      waterColor: '',
      subtitle: 'HERITAGE BOULEVARDS',
      landmark: `
        <rect x="170" y="410" width="58" height="260" fill="#2b160d" />
        <rect x="154" y="380" width="90" height="42" rx="8" fill="#2b160d" />
        <rect x="420" y="450" width="84" height="220" fill="#34180f" />
        <rect x="720" y="480" width="72" height="190" fill="#3a1d12" />
        <rect x="930" y="430" width="54" height="240" fill="#2b160d" />
        <path d="M1180 360h90v310h-90z" fill="#3b1f13" />
        <path d="M1215 260h20v120h-20z" fill="#3b1f13" />
        <path d="M1090 650h260l-22 36H1112z" fill="#22110a" />
      `,
    }
  }

  if (key.includes('mumbai') || key.includes('bombay')) {
    return {
      skyStart: '#38bdf8',
      skyEnd: '#0f172a',
      sunCore: '#fde68a',
      sunGlow: '#f97316',
      sunX: 1240,
      sunY: 170,
      sunRadius: 170,
      horizonBack: 'M0 560C160 540 250 518 380 526C520 535 610 590 770 590C930 590 1010 520 1180 520C1320 520 1460 560 1600 620V900H0Z',
      horizonBackColor: 'rgba(125,211,252,0.22)',
      horizonFront: 'M0 640C180 610 250 620 390 650C510 676 610 704 750 704C930 704 1010 620 1180 620C1340 620 1490 700 1600 752V900H0Z',
      horizonFrontColor: '#11203b',
      water: 'M0 690C190 676 330 712 490 708C650 704 800 662 980 670C1160 678 1350 736 1600 720V900H0Z',
      waterColor: '#0c4a6e',
      subtitle: 'SEA BREEZE SKYLINE',
      landmark: `
        <path d="M226 520h116v150H226z" fill="#15233f" />
        <path d="M226 520l58-82 58 82z" fill="#15233f" />
        <rect x="600" y="410" width="56" height="260" fill="#18263f" />
        <rect x="680" y="370" width="48" height="300" fill="#203357" />
        <rect x="960" y="450" width="88" height="220" fill="#14253f" />
        <rect x="1080" y="390" width="46" height="280" fill="#1e3a5f" />
        <rect x="1138" y="430" width="40" height="240" fill="#28406a" />
      `,
    }
  }

  if (key.includes('bengaluru') || key.includes('bangalore')) {
    return {
      skyStart: '#22c55e',
      skyEnd: '#14532d',
      sunCore: '#dcfce7',
      sunGlow: '#86efac',
      sunX: 1210,
      sunY: 180,
      sunRadius: 165,
      horizonBack: 'M0 520C160 470 340 470 470 520C590 565 680 620 830 620C960 620 1030 560 1160 522C1290 484 1420 494 1600 570V900H0Z',
      horizonBackColor: 'rgba(187,247,208,0.2)',
      horizonFront: 'M0 660C150 592 280 580 420 610C570 642 650 722 820 722C990 722 1090 600 1260 600C1390 600 1490 658 1600 730V900H0Z',
      horizonFrontColor: '#16351f',
      water: '',
      waterColor: '',
      subtitle: 'GARDENS AND TECH LIGHTS',
      landmark: `
        <rect x="210" y="450" width="86" height="220" fill="#183922" />
        <rect x="360" y="410" width="60" height="260" fill="#1e4b2c" />
        <rect x="540" y="470" width="92" height="200" fill="#225431" />
        <path d="M870 510h170v160H870z" fill="#173421" />
        <path d="M900 420h110l50 90H850z" fill="#1d472a" />
        <circle cx="180" cy="600" r="54" fill="#3f7c4f" />
        <circle cx="1160" cy="620" r="74" fill="#2d6a3b" />
      `,
    }
  }

  if (key.includes('dubai')) {
    return {
      skyStart: '#f59e0b',
      skyEnd: '#7c2d12',
      sunCore: '#fff7ed',
      sunGlow: '#fdba74',
      sunX: 1260,
      sunY: 170,
      sunRadius: 190,
      horizonBack: 'M0 560C170 520 320 520 470 556C620 592 720 636 900 632C1110 628 1220 560 1400 560C1480 560 1546 576 1600 604V900H0Z',
      horizonBackColor: 'rgba(254,215,170,0.22)',
      horizonFront: 'M0 690C230 650 330 642 520 680C650 706 760 722 910 700C1080 676 1150 606 1270 604C1390 602 1500 652 1600 712V900H0Z',
      horizonFrontColor: '#40200f',
      water: '',
      waterColor: '',
      subtitle: 'DESERT SKYLINE ESCAPE',
      landmark: `
        <path d="M1110 250h22v420h-22z" fill="#221008" />
        <path d="M1100 670h44l-8 18h-28z" fill="#221008" />
        <path d="M1121 180l24 70h-48z" fill="#221008" />
        <rect x="890" y="410" width="74" height="260" fill="#2f170c" />
        <rect x="970" y="360" width="54" height="310" fill="#3e1f10" />
        <rect x="280" y="470" width="90" height="200" fill="#2c150b" />
      `,
    }
  }

  if (key.includes('singapore')) {
    return {
      skyStart: '#06b6d4',
      skyEnd: '#164e63',
      sunCore: '#cffafe',
      sunGlow: '#67e8f9',
      sunX: 1230,
      sunY: 180,
      sunRadius: 165,
      horizonBack: 'M0 560C170 520 300 520 450 554C610 590 740 614 890 604C1030 594 1150 536 1320 532C1430 530 1528 554 1600 590V900H0Z',
      horizonBackColor: 'rgba(165,243,252,0.2)',
      horizonFront: 'M0 650C170 638 310 664 450 694C590 724 680 732 840 720C1020 706 1130 630 1320 630C1430 630 1526 666 1600 708V900H0Z',
      horizonFrontColor: '#123246',
      water: 'M0 710C180 694 344 726 500 722C658 718 816 684 998 688C1186 692 1384 734 1600 726V900H0Z',
      waterColor: '#0f4c5c',
      subtitle: 'WATERFRONT CITY LIGHTS',
      landmark: `
        <rect x="300" y="430" width="82" height="240" rx="18" fill="#17384f" />
        <rect x="394" y="430" width="82" height="240" rx="18" fill="#1d4762" />
        <rect x="488" y="430" width="82" height="240" rx="18" fill="#275776" />
        <path d="M274 418C350 372 522 372 598 418" fill="none" stroke="#dbeafe" stroke-width="22" stroke-linecap="round" />
        <rect x="860" y="390" width="68" height="280" fill="#143447" />
        <rect x="940" y="440" width="82" height="230" fill="#1a4056" />
      `,
    }
  }

  if (key.includes('london')) {
    return {
      skyStart: '#60a5fa',
      skyEnd: '#1e3a8a',
      sunCore: '#e0f2fe',
      sunGlow: '#93c5fd',
      sunX: 1220,
      sunY: 170,
      sunRadius: 165,
      horizonBack: 'M0 556C160 536 330 510 468 542C616 576 710 630 868 630C1018 630 1120 550 1284 548C1416 546 1510 576 1600 620V900H0Z',
      horizonBackColor: 'rgba(191,219,254,0.18)',
      horizonFront: 'M0 650C170 632 320 648 470 682C620 716 740 730 860 716C990 700 1040 620 1130 602C1240 580 1370 602 1600 712V900H0Z',
      horizonFrontColor: '#182c59',
      water: 'M0 706C150 694 280 706 430 718C582 730 760 718 904 694C1054 670 1220 670 1600 720V900H0Z',
      waterColor: '#173d6c',
      subtitle: 'RIVERSIDE CLASSICS',
      landmark: `
        <rect x="240" y="380" width="68" height="290" fill="#15284f" />
        <rect x="252" y="330" width="44" height="60" fill="#15284f" />
        <circle cx="274" cy="486" r="44" fill="none" stroke="#f8fafc" stroke-width="10" />
        <rect x="630" y="450" width="86" height="220" fill="#1d376c" />
        <rect x="760" y="420" width="96" height="250" fill="#1a2f58" />
        <path d="M1010 442c70-122 198-122 268 0" fill="none" stroke="#dbeafe" stroke-width="20" />
        <rect x="1052" y="442" width="20" height="228" fill="#dbeafe" />
        <rect x="1216" y="442" width="20" height="228" fill="#dbeafe" />
      `,
    }
  }

  if (key.includes('paris')) {
    return {
      skyStart: '#f472b6',
      skyEnd: '#4c1d95',
      sunCore: '#fae8ff',
      sunGlow: '#f9a8d4',
      sunX: 1210,
      sunY: 175,
      sunRadius: 170,
      horizonBack: 'M0 560C180 508 330 506 486 546C626 582 722 628 878 624C1026 620 1126 548 1278 548C1400 548 1502 580 1600 630V900H0Z',
      horizonBackColor: 'rgba(244,114,182,0.16)',
      horizonFront: 'M0 650C182 626 324 658 462 696C596 732 700 736 860 714C1000 694 1088 622 1240 610C1384 598 1490 646 1600 704V900H0Z',
      horizonFrontColor: '#3f1b73',
      water: 'M0 714C170 702 332 720 482 726C622 732 760 712 934 696C1114 680 1326 688 1600 720V900H0Z',
      waterColor: '#312e81',
      subtitle: 'ROMANTIC RIVER VIEWS',
      landmark: `
        <path d="M1080 260h22v410h-22z" fill="#20103b" />
        <path d="M1044 670h94l-18 22h-58z" fill="#20103b" />
        <path d="M1068 436h46l72 174h-190z" fill="#20103b" />
        <rect x="348" y="444" width="86" height="226" fill="#34165c" />
        <rect x="446" y="404" width="66" height="266" fill="#46207c" />
      `,
    }
  }

  if (key.includes('new york')) {
    return {
      skyStart: '#38bdf8',
      skyEnd: '#0f172a',
      sunCore: '#e0f2fe',
      sunGlow: '#60a5fa',
      sunX: 1230,
      sunY: 170,
      sunRadius: 165,
      horizonBack: 'M0 560C176 540 296 528 432 552C582 578 690 632 866 628C1040 624 1120 542 1284 540C1414 538 1518 568 1600 606V900H0Z',
      horizonBackColor: 'rgba(125,211,252,0.16)',
      horizonFront: 'M0 650C144 632 284 650 438 686C596 722 704 726 842 714C986 702 1070 620 1226 610C1380 600 1490 650 1600 714V900H0Z',
      horizonFrontColor: '#13233f',
      water: 'M0 710C166 694 320 716 466 720C612 724 744 702 918 690C1096 678 1336 688 1600 724V900H0Z',
      waterColor: '#0b3b63',
      subtitle: 'ICONIC HARBOR SKYLINE',
      landmark: `
        <rect x="280" y="430" width="76" height="240" fill="#163052" />
        <rect x="380" y="360" width="84" height="310" fill="#203d67" />
        <rect x="490" y="400" width="62" height="270" fill="#173154" />
        <rect x="610" y="310" width="64" height="360" fill="#244b7f" />
        <path d="M1018 474h34v126h-34z" fill="#cbd5e1" />
        <path d="M1032 414h10v60h-10z" fill="#cbd5e1" />
        <path d="M995 600h80l-20 70h-40z" fill="#cbd5e1" />
      `,
    }
  }

  return {
    skyStart: '#0ea5e9',
    skyEnd: '#1e293b',
    sunCore: '#fef3c7',
    sunGlow: '#38bdf8',
    sunX: 1220,
    sunY: 180,
    sunRadius: 170,
    horizonBack: 'M0 550C170 510 320 506 472 544C628 582 740 636 900 628C1066 620 1156 542 1310 540C1422 538 1516 566 1600 610V900H0Z',
    horizonBackColor: 'rgba(191,219,254,0.14)',
    horizonFront: 'M0 660C180 620 320 624 482 670C622 710 742 724 896 706C1056 686 1134 612 1280 610C1400 608 1500 652 1600 714V900H0Z',
    horizonFrontColor: '#18283d',
    water: '',
    waterColor: '',
    subtitle: 'SCENIC CITY GETAWAY',
    landmark: `
      <rect x="240" y="450" width="76" height="220" fill="#18304b" />
      <rect x="352" y="390" width="64" height="280" fill="#214064" />
      <rect x="452" y="430" width="86" height="240" fill="#17314f" />
      <rect x="900" y="400" width="70" height="270" fill="#203f63" />
      <rect x="1006" y="450" width="82" height="220" fill="#17314f" />
    `,
  }
}

function escapeSvgText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function PopularDestinations() {
  const navigate = useNavigate()
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const data = await flightApi.getPopularDestinations()
        // Limit to 6 cards
        setDestinations(data.slice(0, 6))
      } catch (error) {
        console.error('Failed to fetch popular destinations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDestinations()
  }, [])

  function handleDestinationClick(dest: PopularDestination) {
    // Redirect to /results?to=<airportCode>&destinationOnly=true
    navigate(`/results?to=${dest.airportCode}&destinationOnly=true`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (destinations.length === 0) {
    return null
  }

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Trending Now</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Popular Destinations</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {destinations.map((dest, index) => (
          <motion.div
            key={dest.airportCode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[16/9] bg-slate-200"
            onClick={() => handleDestinationClick(dest)}
          >
            <img
              src={getCityImage(dest.destinationName, dest.airportCode)}
              alt={dest.destinationName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const image = e.currentTarget
                image.onerror = null
                image.src = createDestinationPlaceholder(dest)
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="text-xs font-medium text-blue-300 mb-1">{dest.airportCode}</p>
              <h3 className="text-2xl font-bold">{dest.destinationName}</h3>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  )
}
