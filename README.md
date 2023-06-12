# Tests pour le Contrat Voting.sol

## En Résumé
La serie de tests a été découpé en bloc de fonctionnalités

- Une serie de tests sur l'enregistremen des voteurs
- Une serie de tests sur l'enregistrement des propositions
- Une serie de tests sur la session de vote
- Une serie de tests sur le comptage du vote et l'identification du vainqueur

## Résultats

    Contract deployment
      ✔ Should deploy the contract
    > Tests - Registration of voters
      ✔ Should add voter (39ms)
      ✔ Should not add voter if not owner (53ms)
      ✔ Should not add a registered voter (43ms)
      ✔ Should not add proposal when session not started
      ✔ Should stop registration  of voters and start proposal registration
      ✔ Should not stop Proposal Registering
    > Tests - Proposals registration
      ✔ First proposal Should be GENESIS
      ✔ Should add proposal
      ✔ Should not add proposal if Voter not registered
      ✔ Should not add empty proposal
      ✔ Should return the correct voter address
      ✔ Should not startVotingSession
    > Tests - Vote session
      ✔ Should not vote if not registered
      ✔ Should not vote for not found proposal
      ✔ Should not vote more than one time (39ms)
      ✔ Should add vote and count votes (49ms)
      ✔ Should stop vote session and emit event
      ✔ Should NOnotT tallyVotes
    > Tests - Tally Session
      ✔ Should the winning Id equals to 1

  20 passing (4s)

### Couverture

-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |    77.08 |      100 |      100 |                |
  Voting.sol |      100 |    77.08 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |    77.08 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|