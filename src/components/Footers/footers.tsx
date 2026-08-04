import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getFooter, getFooterImages } from '../../Redux/ProductReducer/action';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Search, X, Check, LayoutGrid, Globe, ShieldCheck } from 'lucide-react';
import "./footers.css";
import axios from 'axios';

// Lazy Iframe Card Component with IntersectionObserver Loader
const LazyFooterCard: React.FC<{
  ele: any;
  isSelected: boolean;
  onSelect: (code: string) => void;
}> = ({ ele, isSelected, onSelect }) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const cardDoc = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#fff;}body{zoom:0.32;font-family:sans-serif;color:#333;}img{max-width:100%;height:auto;display:block;}::-webkit-scrollbar{display:none !important;width:0;height:0;}</style></head><body>${ele.code || ''}</body></html>`;

  return (
    <div
      ref={cardRef}
      className={`footer-card-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(ele.code)}
    >
      <div className='footer-card-header'>
        <div className='footer-country-badge'>
          <Globe size={13} className="globe-icon" />
          <span className='country-name'>{ele.country}</span>
        </div>
        {isSelected && <span className='selected-chip'><Check size={12} /> Applied</span>}
      </div>

      <div className='footer-card-iframe-container'>
        {isInView ? (
          <iframe
            srcDoc={cardDoc}
            className='footer-card-iframe'
            title={`footer_preview_${ele.country}`}
            tabIndex={-1}
            loading="lazy"
          />
        ) : (
          <div className='iframe-loading-skeleton'>
            <div className='skeleton-shimmer'></div>
            <span>Loading preview...</span>
          </div>
        )}
      </div>

      <div className='footer-card-action-bar'>
        <button className='btn-apply-footer'>
          {isSelected ? "Re-apply Footer" : "Apply Footer"}
        </button>
      </div>
    </div>
  );
};

const Footers = () => {
  const [footer, setFooter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(6);
  const dispatch = useDispatch();
  const { BrandThemeColor } = useSelector((selector: any) => selector.ProductReducer);
  const [arr, setArray] = useState<any[]>([]);

  if (Array.isArray(arr)) arr.sort((a: any, b: any) => a.country.localeCompare(b.country));

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL || 'http://10.215.56.196:9000'}/footer`).then(res => {
      setArray(res.data.footers || []);
    }).catch(err => {
      // console.log(err)
    });
  }, [BrandThemeColor]);

  const selectFooterItem = (code: string) => {
    setFooter(code);
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');

    const imgElements = doc.querySelectorAll('img');
    const srcValues = Array.from(imgElements).map((img) => img.getAttribute('src'));

    let modifiedSrcValues = srcValues.map((item: any) => {
      let img = item ? item.split("/") : [];
      let finalimg = img.reverse()[0];
      return finalimg;
    });

    dispatch(getFooterImages(modifiedSrcValues));
    localStorage.setItem("mailFooterImages", JSON.stringify(srcValues));
    dispatch(getFooter(code));

    // Auto-scroll child canvas to top of the applied footer block
    try {
      if (typeof (window as any).eval_child_js === "function") {
        (window as any).eval_child_js(`
          (function() {
            var footerEl = document.getElementById('footer') || document.querySelector('footer') || document.querySelector('.footer-row') || document.querySelector('[id*="footer"]');
            if (footerEl) {
              footerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          })()
        `);
      }
    } catch (err) {}
  };

  const filteredFooters = arr.filter((item: any) =>
    item.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const channel = new BroadcastChannel("editor_channel");
    channel.onmessage = (event) => {
      if (event.data && event.data.type === "select-footer") {
        const { code, modifiedSrcValues, srcValues } = event.data.payload;
        setFooter(code);
        dispatch(getFooterImages(modifiedSrcValues));
        localStorage.setItem("mailFooterImages", JSON.stringify(srcValues));
        dispatch(getFooter(code));
      }
    };
    return () => {
      channel.close();
    };
  }, [dispatch]);

  const animateWebviewTransition = (durationMs = 280) => {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      window.dispatchEvent(new Event("resize"));
      if (elapsed < durationMs) {
        requestAnimationFrame(step);
      } else {
        window.dispatchEvent(new Event("resize"));
      }
    };
    requestAnimationFrame(step);
  };

  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const openFooterModal = () => {
    setIsClosing(false);
    setIsPanelVisible(false);
    setDisplayCount(6);
    setIsOpen(true);

    // Step 1: Disable move mode while footer modal is open
    try {
      const modeChannel = new BroadcastChannel("interaction_mode");
      modeChannel.postMessage({ mode: "view" });
      modeChannel.close();
    } catch (e) {}

    // Step 2: Start gliding child webview to left FIRST
    document.body.classList.add("footer-modal-open");
    window.dispatchEvent(new Event("resize"));

    // Step 3: Slide in right side panel at 100ms
    setTimeout(() => {
      setIsPanelVisible(true);
    }, 100);

    const channel = new BroadcastChannel("editor_channel");
    channel.postMessage({ type: "open-footer-modal", blur: true });
    channel.close();
  };

  const closeFooterModal = () => {
    setIsClosing(true);
    
    // Step 1: Right panel slides out first (220ms)
    setTimeout(() => {
      // Step 2: Remove class so webview Lerps smoothly back to original center position
      document.body.classList.remove("footer-modal-open");
      window.dispatchEvent(new Event("resize"));

      // Step 3: Wait for webview Lerp to completely finish & settle before unmounting backdrop blur (320ms)
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);

        // Step 4: Re-enable move mode automatically when modal is closed
        try {
          const modeChannel = new BroadcastChannel("interaction_mode");
          modeChannel.postMessage({ mode: "move" });
          modeChannel.close();
        } catch (e) {}
      }, 320);
    }, 220);

    const channel = new BroadcastChannel("editor_channel");
    channel.postMessage({ type: "close-footer-modal" });
    channel.close();
  };

  const listContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Clean Infinite Scroll: load next batch when scrolling near bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 150) {
      if (displayCount < filteredFooters.length) {
        setDisplayCount((prev) => Math.min(filteredFooters.length, prev + 6));
      }
    }
  };

  useEffect(() => {
    if (!isOpen || !isPanelVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setDisplayCount((prev) => {
            if (prev < filteredFooters.length) {
              return prev + 6;
            }
            return prev;
          });
        }
      },
      {
        root: listContainerRef.current,
        rootMargin: '100px',
        threshold: 0,
      }
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [isOpen, isPanelVisible, displayCount, filteredFooters.length]);

  const selectedItem = arr.find((item: any) => item.code === footer);

  return (
    <>
      <div className='sticky-footer-section'>
        <button
          className='select-footer-trigger-btn'
          onClick={openFooterModal}
        >
          <span className='btn-text'>{selectedItem ? selectedItem.country : "Select Footer"}</span>
        </button>
      </div>

      {isOpen && ReactDOM.createPortal(
        <div className={`footer-modal-overlay-split ${isClosing ? 'closing' : ''}`} onClick={closeFooterModal}>
          <div className='footer-modal-split-container' onClick={(e) => e.stopPropagation()}>
            {/* Left Transparent Pass-through Viewport for Child Webview Live Canvas */}
            <div className='footer-modal-canvas-pass-through'></div>

            {/* Right Card Selection Panel - Slide in only after webview clears area */}
            {isPanelVisible && (
              <div className='footer-modal-selection-panel'>
                <div className='footer-modal-header'>
                  <div className='modal-header-title'>
                    <LayoutGrid size={18} className='modal-title-icon' />
                    <div>
                      <h3>Compliance Footers</h3>
                      <p>Select a country footer to apply directly to canvas</p>
                    </div>
                  </div>
                  <button className='modal-close-btn' onClick={closeFooterModal} title="Close">
                    <X size={16} />
                  </button>
                </div>

                <div className='footer-search-bar'>
                  <Search size={15} className='search-icon' />
                  <input
                    type='text'
                    placeholder='Search by country...'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDisplayCount(6);
                    }}
                    autoFocus
                  />
                  {searchQuery && (
                    <button className='clear-search-btn' onClick={() => { setSearchQuery(''); setDisplayCount(6); }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div
                  ref={listContainerRef}
                  className='footer-grid-cards-list 2-col-grid'
                  onScroll={handleScroll}
                >
                  {filteredFooters.length > 0 ? (
                    <>
                      {filteredFooters.slice(0, displayCount).map((ele: any, i: number) => {
                        const isSelected = footer === ele.code;
                        return (
                          <LazyFooterCard
                            key={i}
                            ele={ele}
                            isSelected={isSelected}
                            onSelect={selectFooterItem}
                          />
                        );
                      })}
                      {displayCount < filteredFooters.length && (
                        <div ref={sentinelRef} style={{ height: '1px', gridColumn: '1 / -1' }} />
                      )}
                    </>
                  ) : (
                    <div className='no-footers-found'>No matching footers found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Footers;