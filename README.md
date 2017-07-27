# EthCon-Viewer

This is a project that I carried out in conjunction with the Data Science Institute at Imperial
The project is still under development.

The purpose of this project is to visualise Ethereum Smart Contract execution on the Ethereum Virtual Machine

This requires a Geth instance running over the default geth http port 8545. Geth should be run with the flags: --rpc --rpcapi "web3,eth,net,admin,debug"
A MongoDB instance is also required, again running over its default port.

Then carry out an NPM install

Visit http://localhost:3005/api/<INSERT_DESIRED_ROUTE?block_num=1000&num_block=10

Depending on the route selected - graphtools
                                - vis
                                - graphviz
                                - sigma
                                -sigmamult
a certain format of graph network represending the control flow diagram will display in the browser. 

The following should be noted:
/sigma will only display the last block requested. 

/vis has a limitation of 30k -45k nodes, depending on structure of the contacts control flow diagram.

/graphtools creates a https://graph-tool.skewed.de/ "graph tools" python library powered static images. 
This should be practically unlimited in terms of number of nodes.

