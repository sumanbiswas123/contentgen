import React, { useState, useEffect } from 'react';
import './mainbox.css';
import Headers from './Headers/headers';
import StandardTemplete from './Gsk_template/standardTemplete';
import Footers from './Footers/footers';
import Fullbody from './Body/fullbody';
import ContentGenGridBuilder from './Body/ContentGenGridBuilder';
import SpeakerModule from './Body/TwocolumnSpecial/SpeakerModule';
import TwocoloumsPCI from "./Body/TwocolumnSpecial/TwocoloumsPCI";
import TwoColoumsIPC from "./Body/TwocolumnSpecial/TwoColoumsIPC";
import IP from './Body/TwocolumnSpecial/IP';
import UpdateEmail from './LayoutEditor/UpdateEmail';
import I2CTA from './Body/TwocolumnSpecial/I2CTA';
import Logout from './Auth/Logout';
import SavedTemplate from './SavedTemplate/SavedTemplate';
import BlockCode from './CodeBlocksFolder/BlockCode';
import { Box, Layers, LayoutTemplate, PanelLeftClose, PanelLeftOpen, Sparkles, Grid } from 'lucide-react';

const Mainbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'content' | 'modules' | 'templates'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  useEffect(() => {
    const handleInspectorMsg = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch (e) {}
      }
      if (data && data.type === "select-inspector-category" && data.category) {
        setSelectedCategory(data.category);
      }
    };
    window.addEventListener("message", handleInspectorMsg);
    return () => {
      window.removeEventListener("message", handleInspectorMsg);
    };
  }, []);

  const handleTabClick = (tab: 'grid' | 'content' | 'modules' | 'templates') => {
    if (isPanelOpen && activeTab === tab) {
      setIsPanelOpen(false);
    } else {
      setActiveTab(tab);
      setIsPanelOpen(true);
    }
  };

  return (
    <div className='maindiv'>
      <div className='mainbox-layout-wrapper'>
        {/* NocodeX Outer Shell: Left Vertical Icon Rail + Collapsible Flyout Content Panel */}
        <div className='nocodex-sidebar-shell'>
          {/* Vertical Icon Rail */}
          <div className='nocodex-icon-rail'>
            <button
              title='Option 1: Grid & Components'
              className={`nocodex-rail-btn ${isPanelOpen && activeTab === 'grid' ? 'active' : ''}`}
              onClick={() => handleTabClick('grid')}
            >
              <Grid size={18} />
              {isPanelOpen && activeTab === 'grid' && <div className='rail-active-indicator' />}
            </button>

            <button
              title='Option 2: Select/Saved Templates'
              className={`nocodex-rail-btn ${isPanelOpen && activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => handleTabClick('templates')}
            >
              <LayoutTemplate size={18} />
              {isPanelOpen && activeTab === 'templates' && <div className='rail-active-indicator' />}
            </button>

            <button
              title='Pre-built Content'
              className={`nocodex-rail-btn ${isPanelOpen && activeTab === 'content' ? 'active' : ''}`}
              onClick={() => handleTabClick('content')}
            >
              <Box size={18} />
              {isPanelOpen && activeTab === 'content' && <div className='rail-active-indicator' />}
            </button>
            
            <button
              title='Special Modules'
              className={`nocodex-rail-btn ${isPanelOpen && activeTab === 'modules' ? 'active' : ''}`}
              onClick={() => handleTabClick('modules')}
            >
              <Layers size={18} />
              {isPanelOpen && activeTab === 'modules' && <div className='rail-active-indicator' />}
            </button>
          </div>

          {/* Collapsible Content Panel */}
          {isPanelOpen && (
            <div className='nocodex-panel-container'>
              {/* Top Panel Header */}
              <div className='nocodex-panel-header'>
                <div className='panel-header-title'>
                  <Sparkles size={14} className='sparkle-icon' />
                  <span>
                    {activeTab === 'grid'
                      ? 'GRID BUILDER'
                      : activeTab === 'templates'
                      ? 'TEMPLATES'
                      : activeTab === 'content'
                      ? 'ADD CONTENT'
                      : 'MODULES'}
                  </span>
                </div>
                <button
                  className='nocodex-hide-btn'
                  onClick={() => setIsPanelOpen(false)}
                  title='Hide Panel'
                >
                  <PanelLeftClose size={13} />
                  <span>HIDE</span>
                </button>
              </div>

              {/* Panel Views */}
              {activeTab === 'grid' && (
                <div className='tab-viewport-content'>
                  <ContentGenGridBuilder />
                </div>
              )}
              {activeTab === 'content' && (
                <>
                  <div className='tab-viewport-content'>
                    <div className='tab-pane-view'>
                      <Fullbody setSelectedCategory={setSelectedCategory} />
                    </div>
                  </div>
                  <Footers />
                </>
              )}
              {activeTab === 'modules' && (
                <div className='tab-viewport-content'>
                  <div className='tab-pane-view'>
                    <BlockCode />
                    {/* @ts-ignore */}
                    <SpeakerModule /> 
                    {/* @ts-ignore */}
                    <TwocoloumsPCI />
                    {/* @ts-ignore */}
                    <TwoColoumsIPC />
                    {/* @ts-ignore */}
                    <IP />
                    {/* @ts-ignore */}
                    <I2CTA />
                  </div>
                </div>
              )}
              {activeTab === 'templates' && (
                <div className='tab-viewport-content tab-viewport-templates'>
                  <SavedTemplate />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Live Iframe Editor Viewport */}
        <div className='iframe-canvas-wrapper'>
          <StandardTemplete />
        </div>

        {/* Right Reordering Sidebar Component */}
        <div className='properties-panel-container'>
          <UpdateEmail selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        </div>
      </div>
    </div>
  );
};

export default Mainbox;