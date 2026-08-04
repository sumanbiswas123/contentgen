import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFooter, getFooterImages } from '../../Redux/ProductReducer/action'
import { Search, X, Check, LayoutGrid } from 'lucide-react'
import "../Footers/footers.css"
import axios from 'axios'

const FooterModalView: React.FC = () => {
  const [footer, setFooter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useDispatch()
  const { BrandThemeColor } = useSelector((selector: any) => selector.ProductReducer)
  const [arr, setArray] = useState<any[]>([])

  if (Array.isArray(arr)) arr.sort((a: any, b: any) => a.country.localeCompare(b.country))

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/footer`).then(res => {
      setArray(res.data.footers || [])
    }).catch(err => {
      // console.log(err)
    })
  }, [footer, BrandThemeColor])

  const selectFooterItem = (code: string) => {
    setFooter(code)
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'text/html')

    const imgElements = doc.querySelectorAll('img')
    const srcValues = Array.from(imgElements).map((img) => img.getAttribute('src'))

    let modifiedSrcValues = srcValues.map((item: any) => {
      let img = item.split("/")
      let finalimg = img.reverse()[0]
      return finalimg
    })

    // Broadcast select action over zero-latency IPC channel to all webviews
    const channel = new BroadcastChannel("editor_channel")
    channel.postMessage({
      type: "select-footer",
      payload: { code, modifiedSrcValues, srcValues }
    })
    channel.close()

    // Close 3rd transparent modal webview
    if (typeof (window as any).close_popup_webview === "function") {
      (window as any).close_popup_webview()
    }
  }

  const handleClose = () => {
    if (typeof (window as any).close_popup_webview === "function") {
      (window as any).close_popup_webview()
    }
  }

  const filteredFooters = arr.filter((item: any) =>
    item.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='footer-modal-overlay' onClick={handleClose}>
      <div className='footer-modal-card' onClick={(e) => e.stopPropagation()}>
        <div className='footer-modal-header'>
          <div className='modal-header-title'>
            <LayoutGrid size={18} className='modal-title-icon' />
            <div>
              <h3>Select Email Footer</h3>
              <p>Choose a country compliance footer for your template</p>
            </div>
          </div>
          <button className='modal-close-btn' onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        <div className='footer-search-bar'>
          <Search size={16} className='search-icon' />
          <input
            type='text'
            placeholder='Search by country name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className='clear-search-btn' onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className='footer-grid-list'>
          {filteredFooters.length > 0 ? (
            filteredFooters.map((ele: any, i: number) => {
              const isSelected = footer === ele.code
              return (
                <button
                  key={i}
                  className={`footer-list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectFooterItem(ele.code)}
                >
                  <div className='item-info'>
                    <span className='country-name'>{ele.country}</span>
                  </div>
                  {isSelected && <Check size={16} className='check-icon' />}
                </button>
              )
            })
          ) : (
            <div className='no-footers-found'>No matching footers found</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FooterModalView
