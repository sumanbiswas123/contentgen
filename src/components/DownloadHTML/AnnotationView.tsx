import AnnotationCard from "./AnnotationCard";

const AnnotationView = ({annotationsArr}: any) =>{

    let style: any ={
        position:"absolute",
        top:"100%",
        right:"0%",
        color:"red",
        height:"80vh",
        overflowY:"scroll",
        backgroundColor: "#ffffff",
        zIndex : 999
    }

    console.log(annotationsArr,"annotationsArr in annotation view")

    return <div style={style}>
        
        {
            annotationsArr && annotationsArr.length> 0 ? annotationsArr.map((annotation: any,index: number)=>{
                return <AnnotationCard key={index} author={annotation.author} content={annotation.content} status={annotation.status} id={annotation.id}/>
            }) : <div>annotations not available</div>
        }
    </div>
}


export default AnnotationView;
