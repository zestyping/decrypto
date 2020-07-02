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

const generateMessage = (rand) => {
  const message = [];
  while (message.length < CODE_LENGTH) {
    const digit = rand(CODE_BASE) + 1;
    if (!message.includes(digit)) message.push(digit);
  }
  return message.join(' ');
};

const Controls = (props) => {
  const [message, setMessage] = useState('');
  const [misses, setMisses] = useState(0);
  const [interceptions, setInterceptions] = useState(0);
  return <div className={'controls ' + props.team}>
    <button className='team-name' onClick={props.selectTeam}>I'm on Team {capitalize(props.team)}</button>
    <button onClick={() => setMessage(generateMessage(props.rand))}>Message to send:</button> <span className='message'>{message}</span>
    <style jsx>{`
      button {
        font-size: 1.2rem;
        padding: 0.4rem 0.8rem;
        margin: 0 1rem;
      }

      .infrared .team-name {
        color: #c40;
      }

      .ultraviolet .team-name {
        color: #40c;
      }

      .team-name {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 1rem;
      }

      .message {
        font-size: 1.2rem;
        font-weight: bold;
      }
    `}</style>
  </div>;
};

const capitalize = (str) => str.substr(0, 1).toUpperCase() + str.substr(1);

const Home = (props) => {
  console.log(props);
  const query = (props.url.asPath.match(/\?(.*)/) || [])[1] || '';
  const [seed, setSeed] = useState(query);
  const [seedTeam, setSeedTeam] = useState('');
  const rand = useRand(seed);
  const words = {};
  for (const team of TEAMS) words[team] = generateWords(rand);

  return <div className="container">
    <Head>
      <title>Play Decrypto Online</title>
    </Head>

    <main>
      <header>
        <h1 className="title">Decrypto</h1>
        <input onChange={event => setSeed(event.target.value)} placeholder='Game ID' value={seed} />
      </header>

      <div className='trays'>
        {
          TEAMS.map(t => <div className={t + ' team'}>
            <Controls key={seed} rand={rand} team={t}
              selectTeam={() => setSeedTeam(`${seed}.${t}`)} />
            <Tray key={t} team={t} words={words[t]}
              show={seed && seedTeam === `${seed}.${t}`} />
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
        width: 11ex;
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
};

export default Home;
