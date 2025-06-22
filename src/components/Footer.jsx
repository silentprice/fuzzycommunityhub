import xIcon from '../assets/xlogo.png'
import dexIcon from '../assets/dexlogo.jpg'
import cafeIcon from '../assets/cafelogo.png'



function Footer() {

    return (
        <footer>
       
                <div className="socialsLogos">
                    <img className="socialsLogo" src={xIcon}></img>
                    <img className="socialsLogo" src={dexIcon}></img>
                    <img className="socialsLogo" src={cafeIcon}></img>
                </div>
            
        </footer>

    )
}


export default Footer