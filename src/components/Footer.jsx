import xIcon from '../assets/xlogo.png';
import dexIcon from '../assets/dexlogo.jpg';
import cafeIcon from '../assets/cafelogo.png';
import fuzzyXblue from '../assets/FUZZYonXblue.png';
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <p>NOT AFFILIATED WITH FUZZY</p>
        <p>Only a community & learning hub</p>
      </div>
      <div className="footer-center">
        <img className="fuzzonxblue-logo" src={fuzzyXblue} alt="Fuzzy on X Blue Logo" />
      </div>
      <div className="footer-right">
        <div className="socialsLogos">
          <a href="https://x.com/fuzzy_xrp" target="_blank" rel="noopener noreferrer">
            <img className="socialsLogo" src={xIcon} alt="X Social Link" />
          </a>
          <a
            href="https://dexscreener.com/xrpl/46555a5a59000000000000000000000000000000.rhcat4hrdi2y9pundkpmzxrdka5wkppr62_xrp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="socialsLogo" src={dexIcon} alt="Dexscreener Link" />
          </a>
          <a href="https://xrp.cafe/collection/fuzzybears" target="_blank" rel="noopener noreferrer">
            <img className="socialsLogo" src={cafeIcon} alt="XRP Cafe Link" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;