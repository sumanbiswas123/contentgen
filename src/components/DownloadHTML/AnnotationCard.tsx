import React, { useCallback, useEffect } from 'react'
import { getCursorPointer } from '../../Redux/ProductReducer/action';
import { useDispatch } from 'react-redux';


const AnnotationCard = ({ author, content, status, id }: any) => {
  const styles: any = {
   card: {
      width: "19vw",
      padding: "20px",
      borderRadius: "16px",
      background: `
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(to right, #BD00FF, #002859) border-box
      `,
      border: "2px solid transparent",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
      position: "relative" as const,
      zIndex: "100",
      marginBottom:"20px"

    },
    cardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.15)"
    },
    author: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "8px",
      display:"none"
    },
    name: {
      fontSize: "10px",
      fontWeight: "600",
      color: "#111827",
      display: "none"
    },
    contentBox: {
      marginTop: "12px",
      padding: "12px",
      borderRadius: "10px",
      background: "#eef2ff",
      color: "#3730a3",
      fontSize: "14px",
      wordBreak: "break-word"
    }
  };


  const dispatch = useDispatch()

  

  const [hover, setHover] = React.useState(false);
  const [annotationStatus, setAnnotationStatus] = React.useState(status);

  useEffect(()=>{},[annotationStatus])




    const handleClick = useCallback((index: number) => {
      let a = document.querySelectorAll(".divCodeBlock");
      a.forEach((item, i) => {
        if (i === index) {
          item.classList.add('blinking-border');
          // setCursor(i);
          localStorage.setItem("cursorPointer", String(i));
          dispatch(getCursorPointer(i));
        } else {
          item.classList.remove('blinking-border');
        }
      });
    }, []);


    // row_index


    const handleCursor = (id: any) => {
      let stored = localStorage.getItem("annotations");
      let annotationsArr = stored ? JSON.parse(stored) : {};
      let item = annotationsArr["annotation"]?.filter((item: any) => item.id == id)
      handleClick(item[0]['row_index'])
    }




const toggleStatus = (id: any) => {
  
  let stored = localStorage.getItem("annotations");
  let annotationsArr = stored ? JSON.parse(stored) : {};

  let updatedArr = annotationsArr["annotation"]?.map((item: any) => {
    if (item.id === id) {
      const newStatus =
        item.status === "resolved" ? "unresolved" : "resolved";

      // ✅ update local state properly
      setAnnotationStatus(newStatus);

      return {
        ...item,
        status: newStatus,
      };
    }
    return item;
  });

  annotationsArr["annotation"] = updatedArr;

  localStorage.setItem("annotations", JSON.stringify(annotationsArr));
};

  return (
    <div
      style={{
        ...styles.card,
        ...(hover ? styles.cardHover : {})
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e)=> {
        e.stopPropagation();
        handleCursor(id)
        }
      }
    >
      <div style={styles.author}>Author</div>
      <div style={styles.name}>{author}</div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"10px"}}>
        <button 
          onClick={(e)=>{
            e.stopPropagation();
            toggleStatus(id)
          }} 
          style={{
            color: "#ffffff", 
            backgroundColor: annotationStatus  == "unresolved"?"#DC2626":"#16A34A",
            border: "none",
            borderRadius: "4px",
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {annotationStatus == "unresolved"?"Open":"Closed"}
        </button>
      </div>

      <div style={styles.contentBox}>
        {content}
      </div>
    </div>
  );
};

export default AnnotationCard;