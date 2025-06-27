import xIcon from '../assets/xlogo.png'
import dexIcon from '../assets/dexlogo.jpg'
import cafeIcon from '../assets/cafelogo.png'
import './footer.css';


function Footer() {

    return (
        <footer>
       
                <div className="socialsLogos">
                    <a href="https://x.com/fuzzy_xrp" target="_blank" rel="noopener noreferrer">
                    <img className="socialsLogo" src={xIcon}></img>
                    </a>
                    <a href="https://dexscreener.com/xrpl/46555a5a59000000000000000000000000000000.rhcat4hrdi2y9pundkpmzxrdka5wkppr62_xrp" target="_blank" rel="noopener noreferrer">
                    <img className="socialsLogo" src={dexIcon} alt="Dexscreener Link" />
                    </a>
                    <a href="https://xrp.cafe/collection/fuzzybears" target="_blank" rel="noopener noreferrer">
                    <img className="socialsLogo" src={cafeIcon} alt="Cafe Link" />
                    </a>
                </div>
            
        </footer>

    )
}


export default Footer