import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getBody } from '../Redux/ProductReducer/action';

const Undo = () => {
    const { Body } = useSelector((selector: any) => selector.ProductReducer);
    const dispatch = useDispatch()

    const removeLastAdded = () => {
        const newBody = [...Body];
        newBody.pop()
        dispatch(getBody(newBody))
    }

  return (
    <div>
        <button onClick={removeLastAdded}>undo</button>
    </div>
  )
}

export default Undo