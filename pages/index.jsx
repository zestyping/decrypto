import Head from 'next/head';
import {useMemo, useState} from 'react';
import {WORDS} from '../words';

const CODE_BASE = 4;
const CODE_LENGTH = 3;

const Tray = (props) => <div className={'tray ' + props.team}>
  {
    props.words.map((word, i) => <div className='slot'>
      <Card key={i} word={word} show={props.show} digit={i + 1} />
      <textarea className='pad' key={i} />
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

      .tray.red {
        background: #f88;
      }

      .tray.blue {
        background: #8cf;
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
        font-size: 0.8rem;
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
  console.log('xmur3', str);
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
  console.log('useRand', seed);
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

const generateMessage = (rand) => {
  return Array.from(Array(CODE_LENGTH)).map(() => rand(CODE_BASE) + 1).join(' ');
};

const Controls = (props) => {
  const [message, setMessage] = useState('');
  const [strikes, setStrikes] = useState(0);
  const [interceptions, setInterceptions] = useState(0);
  return <div className='controls'>
    <div className='team-select'>
      <button onClick={() => props.setTeam(props.team)}>I'm on Team {capitalize(props.team)}</button>
    </div>
    <div>
      <button onClick={() => setMessage(generateMessage(props.rand))}>Message:</button> <span className='message'>{message}</span>
      <button className={strikes >= 2 ? 'lose' : ''} onClick={() => setStrikes(strikes + 1)}>Strikes: {strikes}</button>
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

const Home = () => {
  const [seed, setSeed] = useState(generateSeed());
  const [team, setTeam] = useState('');
  const rand = useRand(seed);
  const redWords = generateWords(rand);
  const blueWords = generateWords(rand);
  const useSeed = () => null;

  return <div className="container">
    <Head>
      <title>Play Decrypto Online</title>
    </Head>

    <main>
      <header>
        <h1 className="title">Decrypto</h1>
        <input onChange={event => setSeed(event.target.value)} placeholder='Game ID' value={seed} />
        <button onClick={() => { setTeam(''); setSeed(generateSeed()); }}>New game</button>
      </header>

      <div className='trays'>
        <div className='red team'>
          <Controls key={seed} rand={rand} team='red' setTeam={setTeam} />
          <Tray key='red' team='red' show={team === 'red'} words={redWords} />
        </div>
        <div className='blue team'>
          <Controls key={seed} rand={rand} team='blue' setTeam={setTeam} />
          <Tray key='blue' team='blue' show={team === 'blue'} words={blueWords} />
        </div>
      </div>

    </main>

    <style jsx>{`
      main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .title {
        line-height: 1.15;
        font-size: 2rem;
        padding: 0 1ex;
      }

      header {
        display: flex;
        align-items: center;
      }

      header input, header button {
        font-size: 1.2rem;
        padding: 0.4rem 0.8rem;
        margin: 0.5rem 1rem;
      }

      header input {
        width: 10ex;
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
