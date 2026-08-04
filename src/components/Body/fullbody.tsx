import React from 'react'
import Hero from './hero'
import ParagraphNew from './ParagraphNew'
import Divider from './divider'
import Signature from './Signature'
import Survey from './Survey'
import CtaButton from './CtaButton'
import References_Footnotes from './References_Footnotes'
import SubjectLineFun from './PreHeader/SubjectLine'
import { PreHeaderFun } from './PreHeader/PreHeaderFun'
import ClaravineGen from './ClaravineGen'
import BrandColorsTable from '../Gsk_template/BrandColors'
import DocumentNumber from './DocumentNumber'
import BrandTheme from './BrandTheme'
import CImage from './CImage'
import HeaderCustom from './HeaderCustom'
import Spacing from './Spacing'
import Code from './Code'
import "./fullbody.css"
import UploadComponent from '../ImageBucket/uploadComponent'
import CustomCss from './CustomCss'

const Fullbody = ({ setSelectedCategory }: any) => {
  return (
    <div className='nocodex-toolbox-container'>
      {/* Category: LAYOUT */}
      <div className='nocodex-category-section'>
        <div className='nocodex-category-header'>
          <span className='cat-dot' style={{ backgroundColor: '#6366f1' }} />
          <span className='cat-title'>LAYOUT</span>
        </div>
        <div className='nocodex-grid'>
          <HeaderCustom setSelectedCategory={setSelectedCategory}/>
          <BrandTheme setSelectedCategory={setSelectedCategory}/>
          <PreHeaderFun setSelectedCategory={setSelectedCategory}/>
          <Spacing setSelectedCategory={setSelectedCategory}/>
          <Divider setSelectedCategory={setSelectedCategory}/>
        </div>
      </div>

      {/* Category: TYPOGRAPHY */}
      <div className='nocodex-category-section'>
        <div className='nocodex-category-header'>
          <span className='cat-dot' style={{ backgroundColor: '#f59e0b' }} />
          <span className='cat-title'>TYPOGRAPHY</span>
        </div>
        <div className='nocodex-grid'>
          <SubjectLineFun setSelectedCategory={setSelectedCategory}/>
          {/* @ts-ignore */}
          <ParagraphNew setSelectedCategory={setSelectedCategory}/>
        </div>
      </div>

      {/* Category: MEDIA */}
      <div className='nocodex-category-section'>
        <div className='nocodex-category-header'>
          <span className='cat-dot' style={{ backgroundColor: '#ec4899' }} />
          <span className='cat-title'>MEDIA</span>
        </div>
        <div className='nocodex-grid'>
          <Hero setSelectedCategory={setSelectedCategory}/>
          <CImage setSelectedCategory={setSelectedCategory}/>
          <UploadComponent setSelectedCategory={setSelectedCategory}/> 
        </div>
      </div>

      {/* Category: INTERACTIVE & UTILITIES */}
      <div className='nocodex-category-section'>
        <div className='nocodex-category-header'>
          <span className='cat-dot' style={{ backgroundColor: '#10b981' }} />
          <span className='cat-title'>INTERACTIVE & UTILITIES</span>
        </div>
        <div className='nocodex-grid'>
          <CtaButton setSelectedCategory={setSelectedCategory}/>
          <CustomCss setSelectedCategory={setSelectedCategory}/>
          <Code setSelectedCategory={setSelectedCategory}/>
          <ClaravineGen setSelectedCategory={setSelectedCategory}/>
          {/* @ts-ignore */}
          <Signature setSelectedCategory={setSelectedCategory}/>
          {/* @ts-ignore */}
          <Survey setSelectedCategory={setSelectedCategory}/>
          {/* @ts-ignore */}
          <References_Footnotes setSelectedCategory={setSelectedCategory}/>
          <BrandColorsTable setSelectedCategory={setSelectedCategory}/>
          <DocumentNumber setSelectedCategory={setSelectedCategory}/>
        </div>
      </div>
    </div>
  )
}

export default Fullbody