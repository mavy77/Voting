const { ethers } = require('hardhat');
const { expect, assert } = require('chai');

describe("Series of tests for Voting contract", function() {

    let voting;
    let owner;
    let voter_1;
    let voter_2; 
    let voter_3;
    let voter_not_registered;

    describe("Initialization of tests series", function () {
    beforeEach(async function () {
        const Voting = await ethers.getContractFactory("Voting");  
        [owner, voter_1, voter_2, voter_3, voter_not_registered] = await ethers.getSigners();
        voting = await Voting.deploy();
      });

      describe("Contract deployment", function () {
        it("Should deploy the contract", async function () {
          expect(await voting.owner()).to.equal(owner.address);
        });
    });
      
    });


    // :::::::::::::::::::::  VOTERS REGISTRATIONS   ::::::::::::::::::::::::::::// 

      describe("> Tests - Registration of voters", function () {
        beforeEach(async function () {
          owner = await ethers.getSigners();
          const contract = await ethers.getContractFactory("Voting");
          voting = await contract.deploy();
        });
    
        it('Should add voter', async function () {
          const event = await voting.addVoter(voter_1.address);
          await expect(event).to.emit(voting, 'VoterRegistered').withArgs(voter_1.address);
        });
    
        it('Should not add voter if not owner', async function () {
          await expect(voting.connect(voter_3).addVoter(voter_1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    
        it('Should not add a registered voter', async function() {
            await voting.addVoter(voter_1.address)
            await expect(voting.addVoter(voter_1.address)).to.be.revertedWith('Already registered')
        })
    
        it('Should not add proposal when session not started', async function() {
            await voting.addVoter(voter_1.address)
            await expect(voting.connect(voter_1).addProposal("First Proposal")).to.be.revertedWith('Proposals are not allowed yet')
        });

        it('Should stop registration  of voters and start proposal registration', async function () {
            const event = await voting.startProposalsRegistering();
            await expect(event).to.emit(voting, 'WorkflowStatusChange').withArgs(0, 1);
          });

        it('Should not stop Proposal Registering', async function() {
            await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet")
        });
    
      });

      // :::::::::::::::::::::  PROPOSALS REGISTRATIONS   ::::::::::::::::::::::::::::// 

      describe("> Tests - Proposals registration", function () {
        beforeEach(async function () {
          [owner, voter_1, voter_2, voter_3, voter_not_registered] = await ethers.getSigners();
          const contract = await ethers.getContractFactory("Voting");
          voting = await contract.deploy();
    
          await voting.addVoter(voter_1.address);
          await voting.addVoter(voter_2.address);
          await voting.addVoter(voter_3.address);

          await voting.startProposalsRegistering();
        });
    
        it('First proposal Should be GENESIS', async function () {
          const proposal = await voting.connect(voter_1).getOneProposal(0);
          expect(proposal.description).to.equal("GENESIS");
        });
    
        it('Should add proposal', async function () {
          const event = await voting.connect(voter_1).addProposal("First Proposal");
          await expect(event).to.emit(voting, 'ProposalRegistered').withArgs(1);
        });
    
        it('Should not add proposal if Voter not registered', async function () {
          await expect(voting.connect(voter_not_registered).addProposal("Third Proposal")).to.be.revertedWith("You're not a voter");
        });
    
        it('Should not add empty proposal', async function () {
          await expect(voting.connect(voter_2).addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
        });
    
        it('Should return the correct voter address', async function () {
            const voter = await voting.connect(voter_1).getVoter(voter_1);
            expect(voter.address).to.equal(voter_1.adress);
        });
    
        it('Should not startVotingSession', async function() {
            await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished")
        });
        
      });

    
    // :::::::::::::::::::::  VOTE SESSION  ::::::::::::::::::::::::::::// 
      
    describe("> Tests - Vote session", function () {
        beforeEach(async function () {
          [owner, voter_1, voter_2, voter_3, voter_not_registered] = await ethers.getSigners();
            const contract = await ethers.getContractFactory("Voting");
            voting = await contract.deploy();
    
            await voting.addVoter(voter_1.address);
            await voting.addVoter(voter_2.address);
            await voting.addVoter(voter_3.address);
    
            await voting.startProposalsRegistering();
    
            await voting.connect(voter_1).addProposal("Proposal A");
            await voting.connect(voter_2).addProposal("Proposal B");
            await voting.connect(voter_3).addProposal("Proposal C");
    
            await voting.endProposalsRegistering();
            await voting.startVotingSession();
        });
    
        it('Should not vote if not registered', async function () {
          await expect(voting.connect(voter_not_registered).setVote(1)).to.be.revertedWith("You're not a voter");
        });
    
        it('Should not vote for not found proposal', async function () {
          await expect(voting.connect(voter_1).setVote(10)).to.be.revertedWith('Proposal not found');
        });
    
        it('Should not vote more than one time', async function () {
          await voting.connect(voter_1).setVote(3);
          await expect(voting.connect(voter_1).setVote(3)).to.be.revertedWith('You have already voted');
        });
    
        it('Should add vote and count votes', async function () {
          let proposal0 = await voting.connect(voter_1).getOneProposal(0);
          await voting.connect(voter_2).setVote(0);
          proposal0 = await voting.connect(voter_1).getOneProposal(0);
          expect(proposal0.voteCount).to.equal(1);
    
          await voting.connect(voter_3).setVote(0);
          proposal0 = await voting.connect(voter_1).getOneProposal(0);
          expect(proposal0.voteCount).to.equal(2);
        });
    
        it('Should stop vote session and emit event', async function () {
          const event = await voting.endVotingSession();
          await expect(event).to.emit(voting, 'WorkflowStatusChange').withArgs(3, 4);
        });
    
        it('Should NOnotT tallyVotes', async function() {
            await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended")
        });
        
      });
    

      // :::::::::::::::::::::  VOTE SESSION  ::::::::::::::::::::::::::::// 

      describe("> Tests - Tally Session", function () {
        beforeEach(async function () {
            [owner, voter_1, voter_2, voter_3, voter_not_registered] = await ethers.getSigners();
            const contract = await ethers.getContractFactory("Voting");
            voting = await contract.deploy();
    
            await voting.addVoter(voter_1.address);
            await voting.addVoter(voter_2.address);
            await voting.addVoter(voter_3.address);
            await voting.addVoter(voter_not_registered.address);
    
            await voting.startProposalsRegistering();
    
            await voting.connect(voter_1).addProposal("Proposal A");
            await voting.connect(voter_2).addProposal("Proposal B");
            await voting.connect(voter_3).addProposal("Proposal C");
    
            await voting.endProposalsRegistering();
    
            await voting.startVotingSession();
    
            await voting.connect(voter_1).setVote(1);
            await voting.connect(voter_2).setVote(1);
            await voting.connect(voter_3).setVote(1);
            await voting.connect(voter_not_registered).setVote(0);
    
        await voting.endVotingSession();
    
        it('Should change status to tallied', async function() {
            const event = await voting.tallyVotes();
            await expect(event).to.emit(voting, 'WorkflowStatusChange').withArgs(4,5);
        })
    
        await voting.tallyVotes();
    
        });
    
        it('Should the winning Id equals to 1', async function () {
          let winningId = await voting.winningProposalID();
          expect(winningId).to.equal(1);
        });
        
      });


    
})