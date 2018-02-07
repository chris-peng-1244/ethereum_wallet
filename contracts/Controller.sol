pragma solidity ^0.4.15;


contract AbstractSweeper {
    function sweep(address token, uint amount) returns (bool);

    function () { require(false); }

    Controller controller;

    function AbstractSweeper(address _controller) {
        controller = Controller(_controller);
    }

    modifier canSweep() {
        require (msg.sender == controller.authorizedCaller() ||  msg.sender == controller.owner());
        require (!controller.halted());
        _;
    }
}

contract Token {
    function balanceOf(address a) returns (uint);
    function transfer(address a, uint val) returns (bool);
}

contract DefaultSweeper is AbstractSweeper {
    function DefaultSweeper(address controller)
             AbstractSweeper(controller) {}

    function sweep(address _token, uint _amount)
    canSweep
    returns (bool) {
        bool success = false;
        address destination = controller.destination();

        if (_token != address(0)) {
            Token token = Token(_token);
            uint amount = _amount;
            if (amount > token.balanceOf(this)) {
                return false;
            }

            success = token.transfer(destination, amount);
            if (success) {
                controller.logSweep(this, destination, _token, _amount);
            }
        }
        else {
            uint amountInWei = _amount;
            if (amountInWei > this.balance) {
                return false;
            }

            destination.transfer(amountInWei);
            controller.logSweep(this, destination, _token, _amount);
        }

        return success;
    }
}

contract UserWallet {
    AbstractSweeperList sweeperList;
    function UserWallet(address _sweeperlist) {
        sweeperList = AbstractSweeperList(_sweeperlist);
    }

    function () public payable { }

    function sweep(address _token, uint _amount)
        returns (bool) {
            (_amount);
            return sweeperList.sweeperOf(_token).delegatecall(msg.data);
    }
}

contract AbstractSweeperList {
    function sweeperOf(address _token) returns (address);
}

contract Controller is AbstractSweeperList {
    address public owner;
    address public authorizedCaller;

    address public destination;

    bool public halted;

    event LogNewWallet(address receiver);
    event LogSweep(address indexed from, address indexed to, address indexed token, uint amount);
    
    modifier onlyOwner() {
        require (msg.sender == owner); 
        _;
    }

    modifier onlyAuthorizedCaller() {
        require (msg.sender == authorizedCaller); 
        _;
    }

    modifier onlyAdmins() {
        require (msg.sender == authorizedCaller || msg.sender == owner); 
        _;
    }

    function Controller() 
    {
        owner = msg.sender;
        destination = msg.sender;
        authorizedCaller = msg.sender;
    }

    function changeAuthorizedCaller(address _newCaller) onlyOwner {
        authorizedCaller = _newCaller;
    }

    function changeDestination(address _dest) onlyOwner {
        destination = _dest;
    }

    function changeOwner(address _owner) onlyOwner {
        owner = _owner;
    }

    function makeWallet() onlyAdmins returns (address wallet)  {
        wallet = address(new UserWallet(this));
        LogNewWallet(wallet);
    }

    function halt() onlyAdmins {
        halted = true;
    }

    function start() onlyOwner {
        halted = false;
    }

    address public defaultSweeper = address(new DefaultSweeper(this));
    mapping (address => address) sweepers;

    function addSweeper(address _token, address _sweeper) onlyOwner {
        sweepers[_token] = _sweeper;
    }

    function sweeperOf(address _token) returns (address) {
        address sweeper = sweepers[_token];
        if (sweeper == 0) sweeper = defaultSweeper;
        return sweeper;
    }

    function logSweep(address from, address to, address token, uint amount) {
        LogSweep(from, to, token, amount);
    }
}
