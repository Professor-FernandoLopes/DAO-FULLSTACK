import './App.css';
import logo from './logo.png';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Routes, Route } from 'react-router-dom';


import React, { useState } from 'react';
import Navbar from './Navbar';
import Join from './Join';
import CreateProposal from './CreateProposal';
import Vote from './Vote';
import Execute from './Execute';
import ClaimRewards from './ClaimRewards';

const App = () => {

  const { address, isConnected } = useAccount();



  

  return (
    <div>
      <Navbar logo={logo} ConnectButton={ConnectButton}/>
      <Routes>
        <Route path="/" element={<Join isConnected={isConnected}/>}/>
        <Route path="/create-proposal" element={<CreateProposal />}/>
        <Route path="/vote" element={<Vote address={address}/>}/>
        <Route path="/execute" element={<Execute />}/>
        <Route path="/claim" element={<ClaimRewards isConnected={isConnected} />}/>
      </Routes>
      
    </div>
  );
};

export default App;
