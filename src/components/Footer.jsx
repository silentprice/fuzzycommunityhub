import { useState } from 'react'
import './Footer.css'
import xIcon from './assets/Icons/Facebook.png'
import dexIcon from './assets/Icons/Pinterest.png'
import cafeIcon from './assets/Icons/Instagram.png'



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