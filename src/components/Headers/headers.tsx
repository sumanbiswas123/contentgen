import React, { useEffect, useState } from 'react'
import { getHeader, getHeaderImages } from '../../Redux/ProductReducer/action'
import { useDispatch, useSelector } from 'react-redux'
import "./headers.css"
import axios from 'axios'

const Headers = () => {
  const [brand, setBrand] = useState("")
  const dispatch = useDispatch()
  const [arr, setArray] = useState<any[]>([])
  const reduxstoreImages = useSelector(
    (selector: any) => selector.ProductReducer.HeaderImages
  );

  if (Array.isArray(arr)) arr.sort((a: any, b: any) => a.country.localeCompare(b.country));

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/Header`).then(res => {
      setArray(res.data.headers || [])
    }).catch(err => {
      // console.log(err)
    })
  }, [brand])

  const seeMagic = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrand(e.target.value)
    const parser = new DOMParser();
    const doc = parser.parseFromString(e.target.value, 'text/html');
    const imgElements = doc.querySelectorAll('img');
    const srcValues = Array.from(imgElements).map((img) => img.getAttribute('src'));

    console.log(srcValues)
    let modifiedSrcValues = srcValues.map((item: any, i: number) => {
      let img = item.split("/")
      let finalimg = img.reverse()[0]
      return finalimg
    })

    dispatch(getHeaderImages(modifiedSrcValues))
    dispatch(getHeader(e.target.value))
  }

  useEffect(() => {
    console.log(reduxstoreImages)
    localStorage.setItem("mailHeaderImages", JSON.stringify(reduxstoreImages))
  }, [reduxstoreImages])

  return (
    <div>
      <select
        name="headers"
        value={brand}
        onChange={seeMagic}
        style={{
          textAlign: "center" as const,
          fontWeight: "bold",
          backgroundColor: "#ffffff",
          width: "100%",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      >
        <option value="">Search Header</option>
        {arr.map(function (ele: any, i: number) {
          return <option key={i} value={ele.code}>{ele.country}</option>
        })}
      </select>
    </div>
  )
}

export default Headers