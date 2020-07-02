import Head from 'next/head';
import {useMemo, useState} from 'react';
import {WORDS} from '../words';

const CODE_BASE = 4;
const CODE_LENGTH = 3;
const TEAMS = ['infrared', 'ultraviolet'];

const Tray = (props) => <div className={'tray ' + props.team}>
  {
    props.words.map((word, i) => <div className='slot' key={i}>
      <Card word={word} show={props.show} digit={i + 1} />
      <textarea className='pad' />
    </div>)
  }
  <style jsx>{`
      .tray {
        margin: 1rem;
        display: flex;
        flex-direction: row;
        padding: 1ex;
        border-radius: 6px;
      }

      .tray.infrared {
        background: #f98;
      }

      .tray.ultraviolet {
        background: #98f;
      }

      .slot {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .pad {
        margin-top: 1em;
        width: 8rem;
        height: 12em;
        font-size: 1rem;
        padding: 1ex;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }
  `}</style>
</div>;

const Card = (props) => <div className='card'>
  <div className='digit'>{props.digit}</div>
  <div className='word'>{props.show ? props.word : '\u00a0'}</div>
  <style jsx>{`
    .card {
      display: flex;
      flex-direction: column;
      background: #eee;
      align-items: center;
      width: 8rem;
      border: 1px solid #666;
      border-radius: 6px;
      padding: 1ex 0;
      margin: 0 1ex;
    }

    .digit {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.25em;
    }

    .word {
      font-size: 1rem;
    }
  `}</style>
</div>

const xmur3 = (str) => {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return () => {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
};

const generateSeed = () => xmur3('' + (new Date().getTime()))() % 90000 + 10000;

const useRand = (seed) => {
  const rng = xmur3('' + seed);
  return n => rng() % n;
};

const range = (n) => Array.from(Array(n).keys());

const generateWords = (rand) => {
  const words = [];
  while (words.length < CODE_BASE) {
    const word = WORDS[rand(WORDS.length)];
    if (!words.includes(word)) words.push(word);
  }
  return words;
};

const Scoreboard = (props) => {
  const [message, setMessage] = useState('');
  const [misses, setMisses] = useState(0);
  const [interceptions, setInterceptions] = useState(0);
  return <div className='controls'>
    <div>
      <button className={misses >= 2 ? 'lose' : ''} onClick={() => setMisses(misses + 1)}>Misses: {misses}</button>
      <button className={interceptions >= 2 ? 'win' : ''} onClick={() => setInterceptions(interceptions + 1)}>Interceptions: {interceptions}</button>
    </div>
    <style jsx>{`
      button {
        font-size: 1.2rem;
        padding: 0.4rem 0.8rem;
        margin: 0.5rem 1rem;
      }

      .lose {
        background: #f88;
        border: 1px solid #f00;
      }

      .win {
        background: #8f8;
        border: 1px solid #080;
      }
    `}</style>
  </div>;
};

const capitalize = (str) => str.substr(0, 1).toUpperCase() + str.substr(1);

const Home = (props) => {
  const [seed, setSeed] = useState(generateSeed());
  const [reveal, setReveal] = useState(0);
  const rand = useRand(seed);
  const words = {};
  const url = 'decrypto.vercel.app/player?' + seed;
  for (const team of TEAMS) words[team] = generateWords(rand);

  return <div className="container">
    <Head>
      <title>Play Decrypto Online</title>
    </Head>

    <main>
      <header>
        <h1 className="title">Decrypto</h1>
        <button onClick={() => setSeed(generateSeed())}>New game</button>
        <input onChange={event => setSeed(event.target.value)} placeholder='Game ID' value={seed} />
        { seed && <a href={'https://' + url}>{url}</a>  }
      </header>

      <div className='trays'>
        {
          TEAMS.map(t => <div key={t} className={t + ' team'}>
            <Scoreboard key={seed} team={t} />
            <Tray team={t} show={reveal === seed} words={words[t]} />
            <div className='reveal'>
              { seed && <button onClick={() => setReveal(seed)}>Reveal</button> }
            </div>
          </div>)
        }
      </div>

    </main>

    <style jsx>{`
      main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .title {
        line-height: 1.15;
        font-size: 2rem;
        padding: 0 1ex;
      }

      header a {
        font-size: 1rem;
        text-decoration: none;
        opacity: 0.5;
        color: #04c;
      }

      header a:hover {
        opacity: 1;
      }

      header {
        display: flex;
        align-items: center;
      }

      header input, header button, .trays button {
        font-size: 1.2rem;
        padding: 0.4rem 0.8rem;
        margin: 0.5rem 0.5rem;
      }

      header input {
        width: 11ex;
      }

      .trays .reveal {
        display: none;
        text-align: right;
        margin-right: 0.5rem;
      }

      .team:last-child .reveal {
        display: block;
      }

      .trays {
        display: flex;
        flex-direction: row;
        margin-top: 1ex;
      }
    `}</style>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>;
}

export default Home
