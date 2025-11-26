'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Upload, Image as ImageIcon, Globe, MapPin, MessageCircle, Settings as SettingsIcon, Zap, Home, PartyPopper } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect } from 'react'
import { CelebrationPopup } from '@/components/celebration-popup'

type TabType = 'homepage' | 'website' | 'cities' | 'whatsapp' | 'algorithm' | 'celebration' | 'others'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('homepage')
  const [logoUrl, setLogoUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Site Title & Favicon
  const [siteTitle, setSiteTitle] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [loadingSiteInfo, setLoadingSiteInfo] = useState(false)
  
  const [cities, setCities] = useState('')
  const [loadingCities, setLoadingCities] = useState(false)
  const [whatsappRouting, setWhatsappRouting] = useState('travel') // 'travel' or 'admin'
  const [adminWhatsapp, setAdminWhatsapp] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false)
  
  // Algorithm settings
  const [sortAlgorithm, setSortAlgorithm] = useState('newest')
  const [verifiedPriority, setVerifiedPriority] = useState(true)
  const [loadingAlgorithm, setLoadingAlgorithm] = useState(false)
  
  // Homepage settings
  const [homePackageCount, setHomePackageCount] = useState('6')
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [showPromo, setShowPromo] = useState(true)
  const [loadingHomepage, setLoadingHomepage] = useState(false)
  
  // Celebration settings
  const [celebrationEnabled, setCelebrationEnabled] = useState(true)
  const [loadingCelebration, setLoadingCelebration] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{
    title: string
    message: string
    emoji: string
    type: 'good' | 'great' | 'amazing' | 'perfect'
  } | null>(null)
  
  // Others tab settings
  const [siteName, setSiteName] = useState('Tripbaitullah')
  const [siteTagline, setSiteTagline] = useState('Temukan paket umroh terbaik')
  const [siteDescription, setSiteDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [loadingOthers, setLoadingOthers] = useState(false)

  useEffect(() => {
    fetchLogo()
    fetchSiteInfo()
    fetchCities()
    fetchWhatsappSettings()
    fetchAlgorithmSettings()
    fetchCelebrationSettings()
    fetchOthersSettings()
    fetchHomepageSettings()
  }, [])

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/settings?key=siteLogo')
      const result = await response.json()
      
      if (result.success && result.data) {
        setLogoUrl(result.data.value)
        setPreviewUrl(result.data.value)
      }
    } catch (error) {
      console.error('Error fetching logo:', error)
    }
  }

  const fetchSiteInfo = async () => {
    try {
      const [titleRes, faviconRes] = await Promise.all([
        fetch('/api/settings?key=siteTitle'),
        fetch('/api/settings?key=siteFavicon')
      ])
      
      const titleResult = await titleRes.json()
      const faviconResult = await faviconRes.json()
      
      if (titleResult.success && titleResult.data) {
        setSiteTitle(titleResult.data.value)
      } else {
        setSiteTitle('Tripbaitullah')
      }
      
      if (faviconResult.success && faviconResult.data) {
        setFaviconUrl(faviconResult.data.value)
        setFaviconPreview(faviconResult.data.value)
      }
    } catch (error) {
      console.error('Error fetching site info:', error)
    }
  }

  const handleSaveSiteInfo = async () => {
    setLoadingSiteInfo(true)
    
    try {
      const requests: Promise<Response>[] = []
      
      // Always save title
      if (siteTitle) {
        requests.push(
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'siteTitle',
              value: siteTitle
            })
          })
        )
      }
      
      // Only save favicon if URL is provided
      if (faviconUrl) {
        requests.push(
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'siteFavicon',
              value: faviconUrl
            })
          })
        )
      }

      if (requests.length === 0) {
        alert('Tidak ada perubahan untuk disimpan')
        setLoadingSiteInfo(false)
        return
      }

      const responses = await Promise.all(requests)
      const results = await Promise.all(responses.map(r => r.json()))

      const allSuccess = results.every((r: any) => r.success)

      if (allSuccess) {
        alert('Informasi website berhasil disimpan! Halaman akan di-refresh.')
        window.location.reload()
      } else {
        const errors = results.filter((r: any) => !r.success).map((r: any) => r.error).join(', ')
        alert('Gagal menyimpan informasi website: ' + errors)
      }
    } catch (error) {
      console.error('Error saving site info:', error)
      alert('Gagal menyimpan informasi website')
    } finally {
      setLoadingSiteInfo(false)
    }
  }

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadFavicon = async () => {
    if (!faviconFile) {
      alert('Pilih file favicon terlebih dahulu')
      return
    }

    setUploadingFavicon(true)
    
    try {
      const formData = new FormData()
      formData.append('file', faviconFile)

      const uploadResponse = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        alert('Gagal upload favicon: ' + uploadResult.error)
        return
      }

      setFaviconUrl(uploadResult.url)
      setFaviconPreview(uploadResult.url)
      setFaviconFile(null)
      alert('Favicon berhasil diupload!')
    } catch (error) {
      console.error('Error uploading favicon:', error)
      alert('Gagal upload favicon')
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'siteLogo',
          value: logoUrl
        })
      })

      const result = await response.json()

      if (result.success) {
        setPreviewUrl(logoUrl)
        alert('Logo berhasil diupdate! Halaman akan di-refresh.')
        window.location.reload()
      } else {
        alert('Gagal menyimpan logo: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving logo:', error)
      alert('Gagal menyimpan logo')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Pilih file terlebih dahulu')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        alert('Gagal upload logo: ' + uploadResult.error)
        return
      }

      // Save the uploaded logo URL to settings
      const saveResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'siteLogo',
          value: uploadResult.url
        })
      })

      const saveResult = await saveResponse.json()

      if (saveResult.success) {
        setLogoUrl(uploadResult.url)
        setPreviewUrl(uploadResult.url)
        setSelectedFile(null)
        alert('Logo berhasil diupload dan disimpan! Halaman akan di-refresh.')
        window.location.reload()
      } else {
        alert('Gagal menyimpan logo: ' + saveResult.error)
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Gagal upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Yakin ingin reset logo ke default?')) {
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: 'siteLogo',
            value: ''
          })
        })

        setLogoUrl('')
        setPreviewUrl('')
        setSelectedFile(null)
        alert('Logo berhasil direset! Halaman akan di-refresh.')
        window.location.reload()
      } catch (error) {
        console.error('Error resetting logo:', error)
        alert('Gagal reset logo')
      }
    }
  }

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/settings?key=departureCities')
      const result = await response.json()
      
      if (result.success && result.data) {
        setCities(result.data.value)
      } else {
        // Set default cities
        setCities('Jakarta, Surabaya, Bandung, Medan, Semarang, Yogyakarta, Makassar, Palembang, Tangerang, Depok, Bekasi, Bogor, Malang, Bali, Balikpapan, Pontianak, Manado, Batam, Pekanbaru, Banjarmasin')
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const handleSaveCities = async () => {
    setLoadingCities(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'departureCities',
          value: cities
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Daftar kota berhasil disimpan!')
      } else {
        alert('Gagal menyimpan daftar kota: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving cities:', error)
      alert('Gagal menyimpan daftar kota')
    } finally {
      setLoadingCities(false)
    }
  }

  const fetchWhatsappSettings = async () => {
    try {
      const [routingRes, phoneRes, adminPhoneRes] = await Promise.all([
        fetch('/api/settings?key=whatsappRouting'),
        fetch('/api/settings?key=adminWhatsapp'),
        fetch('/api/settings?key=adminPhone')
      ])
      
      const routingResult = await routingRes.json()
      const phoneResult = await phoneRes.json()
      const adminPhoneResult = await adminPhoneRes.json()
      
      if (routingResult.success && routingResult.data) {
        setWhatsappRouting(routingResult.data.value)
      }
      
      if (phoneResult.success && phoneResult.data) {
        setAdminWhatsapp(phoneResult.data.value)
      }
      
      if (adminPhoneResult.success && adminPhoneResult.data) {
        setAdminPhone(adminPhoneResult.data.value)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error)
    }
  }

  const handleSaveWhatsappSettings = async () => {
    setLoadingWhatsapp(true)
    
    try {
      const [routingRes, phoneRes, adminPhoneRes] = await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'whatsappRouting',
            value: whatsappRouting
          })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'adminWhatsapp',
            value: adminWhatsapp
          })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'adminPhone',
            value: adminPhone,
            description: 'Nomor WhatsApp Admin Tripbaitullah untuk bantuan'
          })
        })
      ])

      const routingResult = await routingRes.json()
      const phoneResult = await phoneRes.json()
      const adminPhoneResult = await adminPhoneRes.json()

      if (routingResult.success && phoneResult.success && adminPhoneResult.success) {
        alert('Pengaturan WhatsApp berhasil disimpan!')
      } else {
        alert('Gagal menyimpan pengaturan WhatsApp')
      }
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error)
      alert('Gagal menyimpan pengaturan WhatsApp')
    } finally {
      setLoadingWhatsapp(false)
    }
  }

  const fetchAlgorithmSettings = async () => {
    try {
      const [algoRes, priorityRes] = await Promise.all([
        fetch('/api/settings?key=packageSortAlgorithm'),
        fetch('/api/settings?key=verifiedPriority')
      ])
      
      const algoData = await algoRes.json()
      const priorityData = await priorityRes.json()
      
      if (algoData.success && algoData.data) {
        setSortAlgorithm(algoData.data.value)
      }
      if (priorityData.success && priorityData.data) {
        setVerifiedPriority(priorityData.data.value === 'true')
      }
    } catch (error) {
      console.error('Failed to fetch algorithm settings:', error)
    }
  }

  const fetchCelebrationSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=celebrationEnabled')
      const result = await response.json()
      
      if (result.success && result.data) {
        setCelebrationEnabled(result.data.value !== 'false')
      }
    } catch (error) {
      console.error('Failed to fetch celebration settings:', error)
    }
  }

  const saveCelebrationSettings = async () => {
    setLoadingCelebration(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'celebrationEnabled', 
          value: celebrationEnabled.toString(),
          description: 'Enable/disable celebration popup feature'
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Pengaturan popup selebrasi berhasil disimpan!')
      } else {
        alert('❌ Gagal menyimpan pengaturan popup selebrasi')
      }
    } catch (error) {
      console.error('Failed to save celebration settings:', error)
      alert('❌ Gagal menyimpan pengaturan popup selebrasi')
    } finally {
      setLoadingCelebration(false)
    }
  }

  const resetMilestones = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua milestone? Ini akan membuat popup selebrasi muncul lagi untuk milestone yang sudah tercapai.')) {
      alert('Instruksi reset milestone:\n\n1. Buka browser console (F12)\n2. Jalankan: localStorage.removeItem("celebrationMilestones")\n3. Refresh halaman travel admin\n\nAtau kirim instruksi ini ke travel admin.')
    }
  }

  const previewCelebration = () => {
    setPreviewData({
      title: '🎉 Preview Selebrasi!',
      message: 'Ini adalah contoh popup perayaan milestone',
      emoji: '🎉',
      type: 'amazing'
    })
    setShowPreview(true)
  }

  const previewMilestone = (milestone: string, count: number, category: 'views' | 'booking' | 'total-views' | 'total-booking') => {
    let title = ''
    let message = ''
    let emoji = ''
    let type: 'good' | 'great' | 'amazing' | 'perfect' = 'good'

    // Determine celebration type based on count
    if (count === 10) {
      title = '🎯 Bagus!'
      emoji = '🎯'
      type = 'good'
    } else if (count === 100) {
      title = '🔥 Mantap!'
      emoji = '🔥'
      type = 'great'
    } else if (count === 500) {
      title = '⭐ Luar Biasa!'
      emoji = '⭐'
      type = 'amazing'
    } else if (count === 1000) {
      title = '💎 Sempurna!'
      emoji = '💎'
      type = 'perfect'
    }

    // Determine message based on category
    if (category === 'views') {
      message = `Paket "Contoh Paket Umroh" telah dilihat ${count} kali! Terus tingkatkan kualitas paket Anda!`
    } else if (category === 'booking') {
      message = `Paket "Contoh Paket Umroh" telah di-booking ${count} kali! Luar biasa!`
    } else if (category === 'total-views') {
      message = `Total semua paket Anda telah dilihat ${count} kali! Pencapaian yang membanggakan!`
    } else if (category === 'total-booking') {
      message = `Total booking semua paket Anda mencapai ${count} kali! Pertahankan performa Anda!`
    }

    setPreviewData({ title, message, emoji, type })
    setShowPreview(true)
  }

  const saveAlgorithmSettings = async () => {
    setLoadingAlgorithm(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'packageSortAlgorithm',
            value: sortAlgorithm,
            description: 'Algorithm for sorting packages'
          })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'verifiedPriority',
            value: verifiedPriority.toString(),
            description: 'Prioritize verified travel packages'
          })
        })
      ])
      alert('✅ Pengaturan algoritma berhasil disimpan!')
    } catch (error) {
      alert('❌ Gagal menyimpan pengaturan')
    } finally {
      setLoadingAlgorithm(false)
    }
  }

  const fetchOthersSettings = async () => {
    try {
      const keys = ['siteName', 'siteTagline', 'siteDescription', 'contactEmail', 'contactPhone', 'contactAddress', 'facebook', 'instagram', 'twitter', 'youtube', 'metaTitle', 'metaDescription', 'metaKeywords']
      const responses = await Promise.all(keys.map(key => fetch(`/api/settings?key=${key}`)))
      const results = await Promise.all(responses.map(r => r.json()))
      
      results.forEach((result, index) => {
        if (result.success && result.data) {
          const key = keys[index]
          const value = result.data.value
          
          switch(key) {
            case 'siteName': setSiteName(value); break
            case 'siteTagline': setSiteTagline(value); break
            case 'siteDescription': setSiteDescription(value); break
            case 'contactEmail': setContactEmail(value); break
            case 'contactPhone': setContactPhone(value); break
            case 'contactAddress': setContactAddress(value); break
            case 'facebook': setFacebook(value); break
            case 'instagram': setInstagram(value); break
            case 'twitter': setTwitter(value); break
            case 'youtube': setYoutube(value); break
            case 'metaTitle': setMetaTitle(value); break
            case 'metaDescription': setMetaDescription(value); break
            case 'metaKeywords': setMetaKeywords(value); break
          }
        }
      })
    } catch (error) {
      console.error('Error fetching others settings:', error)
    }
  }

  const saveSiteInfo = async () => {
    setLoadingOthers(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'siteName', value: siteName })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'siteTagline', value: siteTagline })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'siteDescription', value: siteDescription })
        })
      ])
      alert('✅ Informasi website berhasil disimpan!')
    } catch (error) {
      alert('❌ Gagal menyimpan informasi website')
    } finally {
      setLoadingOthers(false)
    }
  }

  const saveContactInfo = async () => {
    setLoadingOthers(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'contactEmail', value: contactEmail })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'contactPhone', value: contactPhone })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'contactAddress', value: contactAddress })
        })
      ])
      alert('✅ Informasi kontak berhasil disimpan!')
    } catch (error) {
      alert('❌ Gagal menyimpan informasi kontak')
    } finally {
      setLoadingOthers(false)
    }
  }

  const saveSocialMedia = async () => {
    setLoadingOthers(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'facebook', value: facebook })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'instagram', value: instagram })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'twitter', value: twitter })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'youtube', value: youtube })
        })
      ])
      alert('✅ Social media berhasil disimpan!')
    } catch (error) {
      alert('❌ Gagal menyimpan social media')
    } finally {
      setLoadingOthers(false)
    }
  }

  const saveSEOSettings = async () => {
    setLoadingOthers(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'metaTitle', value: metaTitle })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'metaDescription', value: metaDescription })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'metaKeywords', value: metaKeywords })
        })
      ])
      alert('✅ SEO settings berhasil disimpan!')
    } catch (error) {
      alert('❌ Gagal menyimpan SEO settings')
    } finally {
      setLoadingOthers(false)
    }
  }

  const fetchHomepageSettings = async () => {
    try {
      const [countRes, analyticsRes, promoRes] = await Promise.all([
        fetch('/api/settings?key=homePackageCount'),
        fetch('/api/settings?key=showAnalytics'),
        fetch('/api/settings?key=showPromo')
      ])
      
      const countResult = await countRes.json()
      const analyticsResult = await analyticsRes.json()
      const promoResult = await promoRes.json()
      
      if (countResult.success && countResult.data) {
        setHomePackageCount(countResult.data.value)
      }
      if (analyticsResult.success && analyticsResult.data) {
        setShowAnalytics(analyticsResult.data.value === 'true')
      }
      if (promoResult.success && promoResult.data) {
        setShowPromo(promoResult.data.value === 'true')
      }
    } catch (error) {
      console.error('Error fetching homepage settings:', error)
    }
  }

  const saveHomepageSettings = async () => {
    setLoadingHomepage(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            key: 'homePackageCount', 
            value: homePackageCount,
            description: 'Number of packages to show on homepage'
          })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            key: 'showAnalytics', 
            value: showAnalytics.toString(),
            description: 'Show analytics section on homepage'
          })
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            key: 'showPromo', 
            value: showPromo.toString(),
            description: 'Show promo section on homepage'
          })
        })
      ])
      alert('✅ Pengaturan beranda berhasil disimpan!')
    } catch (error) {
      alert('❌ Gagal menyimpan pengaturan beranda')
    } finally {
      setLoadingHomepage(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Website</h1>
        <p className="text-gray-600">Kelola pengaturan dan konfigurasi website</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('homepage')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === 'homepage'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Home className="w-5 h-5" />
            Beranda
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === 'website'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Globe className="w-5 h-5" />
            Pengaturan Website
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
              ${activeTab === 'cities'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <MapPin className="w-5 h-5" />
            Kota Keberangkatan
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
              ${activeTab === 'whatsapp'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <MessageCircle className="w-5 h-5" />
            Pengaturan WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('algorithm')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
              ${activeTab === 'algorithm'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Zap className="w-4 h-4" />
            Algoritma
          </button>
          <button
            onClick={() => setActiveTab('celebration')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === 'celebration'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <PartyPopper className="w-4 h-4" />
            Pop UP Selebrasi
          </button>
          <button
            onClick={() => setActiveTab('others')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
              ${activeTab === 'others'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <SettingsIcon className="w-5 h-5" />
            Pengaturan Lainnya
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'homepage' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Pengaturan Halaman Beranda</h2>
              <p className="text-sm text-gray-600">
                Atur tampilan dan konten yang ditampilkan di halaman beranda
              </p>
            </div>

            {/* Package Count */}
            <div className="space-y-3">
              <Label htmlFor="homePackageCount">Jumlah Paket Umroh di Beranda</Label>
              <select
                id="homePackageCount"
                value={homePackageCount}
                onChange={(e) => setHomePackageCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="4">4 Paket</option>
                <option value="6">6 Paket</option>
                <option value="8">8 Paket</option>
                <option value="10">10 Paket</option>
              </select>
              <p className="text-xs text-gray-500">
                Tentukan berapa banyak paket umroh yang ditampilkan di halaman beranda
              </p>
            </div>

            {/* Show Analytics Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">Tampilkan Data Analitik</h3>
                <p className="text-xs text-gray-500">
                  Menampilkan section data analitik (jumlah keberangkatan bulan ini, bulan depan, dan total paket)
                </p>
              </div>
              <Switch
                checked={showAnalytics}
                onCheckedChange={setShowAnalytics}
              />
            </div>

            {/* Show Promo Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">Tampilkan Section Promo</h3>
                <p className="text-xs text-gray-500">
                  Menampilkan section informasi promo (banner orange di halaman beranda)
                </p>
              </div>
              <Switch
                checked={showPromo}
                onCheckedChange={setShowPromo}
              />
            </div>

            {/* Preview Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                📋 Preview Pengaturan:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Jumlah paket: <strong>{homePackageCount} paket</strong></li>
                <li>• Data analitik: <strong>{showAnalytics ? 'Ditampilkan' : 'Disembunyikan'}</strong></li>
                <li>• Section promo: <strong>{showPromo ? 'Ditampilkan' : 'Disembunyikan'}</strong></li>
              </ul>
            </div>

            {/* Save Button */}
            <Button
              onClick={saveHomepageSettings}
              disabled={loadingHomepage}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loadingHomepage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan Beranda
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'website' && (
        <>
          {/* Site Title & Favicon */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Informasi Website</h2>
                <p className="text-sm text-gray-600">
                  Atur judul website dan favicon yang ditampilkan di browser
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Title */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteTitle">Judul Website</Label>
                    <Input
                      id="siteTitle"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      placeholder="Tripbaitullah"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Judul ini akan muncul di tab browser
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="faviconUrl">URL Favicon</Label>
                    <Input
                      id="faviconUrl"
                      type="url"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Atau upload file favicon di sebelah kanan
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveSiteInfo}
                    disabled={loadingSiteInfo || !siteTitle}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {loadingSiteInfo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Informasi Website
                      </>
                    )}
                  </Button>
                </div>

                {/* Favicon Upload & Preview */}
                <div className="space-y-4">
                  <div>
                    <Label>Upload Favicon</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="faviconFile"
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {faviconFile ? faviconFile.name : 'Klik untuk pilih favicon'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ICO, PNG (16x16 atau 32x32)
                          </p>
                        </div>
                      </label>
                      <input
                        id="faviconFile"
                        type="file"
                        accept="image/x-icon,image/png,image/ico"
                        onChange={handleFaviconFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {faviconFile && (
                    <Button
                      onClick={handleUploadFavicon}
                      disabled={uploadingFavicon}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {uploadingFavicon ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Favicon
                        </>
                      )}
                    </Button>
                  )}

                  {/* Favicon Preview */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {faviconPreview ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center p-2">
                            <img
                              src={faviconPreview}
                              alt="Favicon Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">Preview Favicon</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Ukuran aktual akan lebih kecil di browser
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">Belum ada favicon</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-blue-900 mb-1">
                      💡 Tips Favicon:
                    </h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Ukuran: 16x16px atau 32x32px</li>
                      <li>• Format: .ico atau .png</li>
                      <li>• Desain sederhana lebih baik</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Logo Website */}
          <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Logo Website</h2>
            <p className="text-sm text-gray-600">
              Upload atau masukkan URL logo yang akan ditampilkan di header website
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              {/* Upload File Section */}
              <div>
                <Label htmlFor="logoFile">Upload Logo</Label>
                <div className="mt-2">
                  <label
                    htmlFor="logoFile"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Klik untuk pilih file'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, SVG (Max 2MB)
                      </p>
                    </div>
                  </label>
                  <input
                    id="logoFile"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {selectedFile && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Simpan Logo
                    </>
                  )}
                </Button>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">atau</span>
                </div>
              </div>

              {/* URL Input Section */}
              <div>
                <Label htmlFor="logoUrl">URL Logo</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Atau masukkan URL gambar logo
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={loading || !logoUrl}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan URL
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading || uploading}
                >
                  Reset
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Tips Upload Logo:
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Gunakan format PNG dengan background transparan</li>
                  <li>• Ukuran rekomendasi: 200x200px atau 1:1 ratio</li>
                  <li>• Maksimal ukuran file: 2MB</li>
                  <li>• Upload langsung dari komputer atau gunakan URL</li>
                </ul>
              </div>
            </div>

            {/* Preview Section */}
            <div>
              <Label>Preview Logo</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center p-4">
                        <img
                          src={previewUrl}
                          alt="Logo Preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=TB&background=10b981&color=fff&size=128&bold=true'
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Logo Aktif</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Logo ini akan ditampilkan di header website
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Belum ada logo</p>
                    <p className="text-xs text-gray-500">
                      Masukkan URL logo untuk melihat preview
                    </p>
                  </div>
                )}
              </div>

              {/* Current Logo Display */}
              {previewUrl && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Tampilan di Header:</p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center p-1">
                      <img
                        src={previewUrl}
                        alt="Header Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">Tripbaitullah</p>
                      <p className="text-xs text-gray-500">Temukan paket umroh terbaik</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </Card>
        </>
      )}

      {activeTab === 'cities' && (
        <Card className="p-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Kota Keberangkatan</h2>
          <p className="text-sm text-gray-600 mb-4">
            Kelola daftar kota keberangkatan untuk travel umroh (pisahkan dengan koma)
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cities">Daftar Kota</Label>
              <Input
                id="cities"
                placeholder="Jakarta, Surabaya, Bandung, Medan, Semarang"
                value={cities}
                onChange={(e) => setCities(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pisahkan setiap kota dengan koma. Kota-kota ini akan muncul sebagai pilihan dropdown saat input data travel.
              </p>
            </div>
            <Button 
              onClick={handleSaveCities}
              disabled={loadingCities}
              className="bg-primary hover:bg-primary/90"
            >
              {loadingCities ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Daftar Kota
                </>
              )}
            </Button>
          </div>
        </div>
        </Card>
      )}

      {activeTab === 'whatsapp' && (
        <Card className="p-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Pengaturan WhatsApp</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tentukan kemana chat WhatsApp dari tombol booking akan diarahkan
          </p>
          <div className="space-y-4">
            <div>
              <Label>Arahkan Chat Ke</Label>
              <div className="mt-2 space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: whatsappRouting === 'travel' ? '#10b981' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="whatsappRouting"
                    value="travel"
                    checked={whatsappRouting === 'travel'}
                    onChange={(e) => setWhatsappRouting(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Nomor WhatsApp Travel</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Chat akan diarahkan ke nomor WhatsApp masing-masing travel yang menawarkan paket
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: whatsappRouting === 'admin' ? '#10b981' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="whatsappRouting"
                    value="admin"
                    checked={whatsappRouting === 'admin'}
                    onChange={(e) => setWhatsappRouting(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Nomor WhatsApp Admin Tripbaitullah</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Semua chat akan diarahkan ke nomor WhatsApp admin Tripbaitullah
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {whatsappRouting === 'admin' && (
              <div>
                <Label htmlFor="adminWhatsapp">Nomor WhatsApp Admin (untuk Routing)</Label>
                <Input
                  id="adminWhatsapp"
                  type="tel"
                  placeholder="628123456789 (format: 628xxx tanpa +)"
                  value={adminWhatsapp}
                  onChange={(e) => setAdminWhatsapp(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan nomor WhatsApp dengan format 628xxx (tanpa tanda + atau spasi)
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Label htmlFor="adminPhone">Nomor Admin Tripbaitullah (untuk Tombol Bantuan)</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  +62
                </span>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="8123456789"
                  value={adminPhone.startsWith('62') ? adminPhone.slice(2) : adminPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setAdminPhone('62' + value)
                  }}
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nomor ini akan digunakan untuk tombol "Butuh Bantuan?" di sidebar travel admin. Format otomatis: 62 + nomor Anda
              </p>
            </div>

            <Button 
              onClick={handleSaveWhatsappSettings}
              disabled={loadingWhatsapp || (whatsappRouting === 'admin' && !adminWhatsapp)}
              className="bg-primary hover:bg-primary/90"
            >
              {loadingWhatsapp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>
        </Card>
      )}

      {activeTab === 'algorithm' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Pengaturan Algoritma Sorting</h2>
              <p className="text-sm text-gray-600">
                Atur bagaimana paket umroh diurutkan dan ditampilkan di halaman user
              </p>
            </div>

            {/* Sort Algorithm Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Susunan Paket</Label>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  Pilih bagaimana paket umroh diurutkan di halaman user
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: sortAlgorithm === 'popular' ? '#10b981' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="algorithm"
                    value="popular"
                    checked={sortAlgorithm === 'popular'}
                    onChange={(e) => setSortAlgorithm(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">📊 Populer</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Urutkan berdasarkan paket yang paling banyak dilihat, difavoritkan, dan di-booking
                    </div>
                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                      Score = Views + (Favorit × 2) + (Booking × 3)
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: sortAlgorithm === 'random' ? '#10b981' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="algorithm"
                    value="random"
                    checked={sortAlgorithm === 'random'}
                    onChange={(e) => setSortAlgorithm(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">🎲 Random</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Susunan acak yang berubah setiap hari (memberikan kesempatan yang adil untuk semua travel)
                    </div>
                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                      Urutan konsisten dalam 1 hari, berubah setiap hari
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: sortAlgorithm === 'newest' ? '#10b981' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="algorithm"
                    value="newest"
                    checked={sortAlgorithm === 'newest'}
                    onChange={(e) => setSortAlgorithm(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">🆕 Terbaru</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Urutkan berdasarkan paket yang baru diupload (paket terbaru muncul duluan)
                    </div>
                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                      Berdasarkan tanggal pembuatan paket
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Verified Priority Toggle */}
            <div className="border-t pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-base font-semibold">✓ Prioritas Travel Verified</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Paket dari travel verified akan selalu muncul lebih dulu sebelum travel non-verified
                  </p>
                  <div className="text-xs text-gray-500 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <strong>Catatan:</strong> Paket yang di-pin akan tetap muncul paling atas, diikuti travel verified (jika aktif), baru kemudian algoritma sorting yang dipilih
                  </div>
                </div>
                <Switch
                  checked={verifiedPriority}
                  onCheckedChange={setVerifiedPriority}
                />
              </div>
            </div>

            {/* Priority Order Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                📌 Urutan Prioritas Akhir:
              </h3>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">1.</span>
                  <span><strong>Paket yang di-Pin</strong> (selalu paling atas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span><strong>Travel Verified</strong> {verifiedPriority ? '(✓ Aktif)' : '(✗ Nonaktif)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">3.</span>
                  <span><strong>Algoritma Sorting:</strong> {
                    sortAlgorithm === 'popular' ? 'Populer' :
                    sortAlgorithm === 'random' ? 'Random' :
                    'Terbaru'
                  }</span>
                </li>
              </ol>
            </div>
            
            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={saveAlgorithmSettings}
                disabled={loadingAlgorithm}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loadingAlgorithm ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan Algoritma
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'celebration' && (
        <>
          {/* Preview Popup */}
          {showPreview && previewData && (
            <CelebrationPopup
              isOpen={true}
              onClose={() => {
                setShowPreview(false)
                setPreviewData(null)
              }}
              title={previewData.title}
              message={previewData.message}
              emoji={previewData.emoji}
              type={previewData.type}
            />
          )}
          
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Pengaturan Pop UP Selebrasi</h2>
                <p className="text-sm text-gray-600">
                  Atur popup perayaan yang muncul saat travel admin mencapai milestone tertentu
                </p>
              </div>

              {/* Enable/Disable Celebration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="celebrationEnabled" className="text-base font-semibold">Aktifkan Pop UP Selebrasi</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Popup akan muncul saat travel admin mencapai milestone views atau booking
                    </p>
                  </div>
                  <Switch
                    id="celebrationEnabled"
                    checked={celebrationEnabled}
                    onCheckedChange={setCelebrationEnabled}
                  />
                </div>
              </div>

              {/* Milestone Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-base font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <PartyPopper className="w-5 h-5" />
                  Milestone yang Ditrack
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Per Paket Umroh */}
                  <div>
                    <h4 className="font-medium text-purple-800 mb-3">Per Paket Umroh:</h4>
                    <div className="space-y-3">
                      {/* 10 Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-medium">10 views → Bagus!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('10 views', 10, 'views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 10 views
                        </div>
                      </div>

                      {/* 100 Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔥</span>
                            <span className="text-sm font-medium">100 views → Mantap!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('100 views', 100, 'views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 100 views
                        </div>
                      </div>

                      {/* 500 Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span className="text-sm font-medium">500 views → Luar Biasa!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('500 views', 500, 'views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 500 views
                        </div>
                      </div>

                      {/* 1000 Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💎</span>
                            <span className="text-sm font-medium">1000 views → Sempurna!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('1000 views', 1000, 'views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 1000 views
                        </div>
                      </div>

                      {/* 10 Booking */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-medium">10 booking → Bagus!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('10 booking', 10, 'booking')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 10 booking clicks
                        </div>
                      </div>

                      {/* 100 Booking */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔥</span>
                            <span className="text-sm font-medium">100 booking → Mantap!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('100 booking', 100, 'booking')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 100 booking clicks
                        </div>
                      </div>

                      {/* 500 Booking */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span className="text-sm font-medium">500 booking → Luar Biasa!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('500 booking', 500, 'booking')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat paket mencapai 500 booking clicks
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Semua Paket */}
                  <div>
                    <h4 className="font-medium text-purple-800 mb-3">Total Semua Paket:</h4>
                    <div className="space-y-3">
                      {/* 100 Total Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-medium">100 total views → Bagus!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('100 total views', 100, 'total-views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat total views mencapai 100
                        </div>
                      </div>

                      {/* 500 Total Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span className="text-sm font-medium">500 total views → Luar Biasa!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('500 total views', 500, 'total-views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat total views mencapai 500
                        </div>
                      </div>

                      {/* 1000 Total Views */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💎</span>
                            <span className="text-sm font-medium">1000 total views → Sempurna!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('1000 total views', 1000, 'total-views')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat total views mencapai 1000
                        </div>
                      </div>

                      {/* 100 Total Booking */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-medium">100 total booking → Bagus!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('100 total booking', 100, 'total-booking')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat total booking mencapai 100
                        </div>
                      </div>

                      {/* 500 Total Booking */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span className="text-sm font-medium">500 total booking → Luar Biasa!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('500 total booking', 500, 'total-booking')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat total booking mencapai 500
                        </div>
                      </div>

                      {/* 1000 Total Booking */}
                      <div className="bg-white/60 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💎</span>
                            <span className="text-sm font-medium">1000 total booking → Sempurna!</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMilestone('1000 total booking', 1000, 'total-booking')}
                            className="h-7 text-xs"
                          >
                            Preview
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 ml-7">
                          Popup muncul saat total booking mencapai 1000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={previewCelebration}
                  variant="outline"
                  className="flex-1"
                >
                  <PartyPopper className="w-4 h-4 mr-2" />
                  Preview Popup
                </Button>
                
                <Button 
                  onClick={resetMilestones}
                  variant="outline"
                  className="flex-1"
                >
                  Reset Milestone
                </Button>
              </div>

              {/* Save Button */}
              <Button 
                onClick={saveCelebrationSettings}
                disabled={loadingCelebration}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loadingCelebration ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan Pop UP Selebrasi
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Popup hanya muncul di dashboard travel admin</li>
                  <li>• Setiap milestone hanya muncul sekali per browser</li>
                  <li>• Milestone disimpan di localStorage browser</li>
                  <li>• Clear browser data akan reset semua milestone</li>
                  <li>• User harus close popup dengan tombol X</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'others' && (
        <>
          <Card className="p-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Informasi Website</h2>
              <p className="text-sm text-gray-600 mb-4">
                Pengaturan informasi dasar website
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Nama Website</Label>
                    <Input
                      id="siteName"
                      placeholder="Tripbaitullah"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteTagline">Tagline</Label>
                    <Input
                      id="siteTagline"
                      placeholder="Temukan paket umroh terbaik"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="siteDescription">Deskripsi Website</Label>
                  <Input
                    id="siteDescription"
                    placeholder="Platform pencarian dan perbandingan paket umroh terbaik"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={saveSiteInfo}
                  disabled={loadingOthers}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loadingOthers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Informasi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Kontak</h2>
              <p className="text-sm text-gray-600 mb-4">
                Informasi kontak yang ditampilkan di website
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="info@tripbaitullah.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Telepon</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+62 21 1234 5678"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactAddress">Alamat</Label>
                  <Input
                    id="contactAddress"
                    placeholder="Jl. Contoh No. 123, Jakarta"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={saveContactInfo}
                  disabled={loadingOthers}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loadingOthers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Kontak
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Social Media</h2>
              <p className="text-sm text-gray-600 mb-4">
                Link ke akun media sosial
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/tripbaitullah"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/tripbaitullah"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/tripbaitullah"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="https://youtube.com/@tripbaitullah"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={saveSocialMedia}
                  disabled={loadingOthers}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loadingOthers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Social Media
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">SEO & Meta Tags</h2>
              <p className="text-sm text-gray-600 mb-4">
                Optimasi mesin pencari
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Tripbaitullah - Platform Pencarian Paket Umroh Terbaik"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimal 60 karakter
                  </p>
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Input
                    id="metaDescription"
                    placeholder="Temukan dan bandingkan paket umroh terbaik dari berbagai travel terpercaya"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimal 160 karakter
                  </p>
                </div>
                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    placeholder="umroh, paket umroh, travel umroh, haji"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pisahkan dengan koma
                  </p>
                </div>
                <Button 
                  onClick={saveSEOSettings}
                  disabled={loadingOthers}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loadingOthers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan SEO Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
