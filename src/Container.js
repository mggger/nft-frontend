import React from "react";

export default class Container extends React.Component {
    constructor(props) {
        super(props);
        this.address = null;
        this.contract = null;
        this.state = {data: []}
    }

    async init() {
        if (window.conflux !== undefined) {
            this.conflux = window.conflux;
            await window.conflux.enable()
            this.address = window.conflux.selectedAddress;
            var CONFIG = require('./config.json');

            this.contract = window.confluxJS.Contract({
                address: CONFIG.CONTRACT_ADDRESS,
                abi: CONFIG.abi
            });
        }
    }

    componentDidMount() {
        this.handleLoad();
    }

    render() {
        return (<div>
            <ul>
                <p> 你有{this.state.data.length}个nft</p>
                {this.state.data.map(el => (
                    <li>
                        {el.name}
                        <img src={el.image} width='200px' height='200px'/>
                        <br/>
                    </li>
                ))}
            </ul>
        </div>)
    }

    handleLoad() {
        this.init().then(_ =>
            this.getTokenIds()).then(
            tokens => {
                var promises = tokens.map(
                    token => this.getMetaData(token[0])
                )
                Promise.all(promises).then(
                    (urls) => {

                        var promisesGet = urls.map(
                            url => {
                                return this.fetchGet(url)
                            }
                        )

                        Promise.all(promisesGet)
                            .then(
                                jsonArr => {
                                    this.setState({data: jsonArr})
                                }
                            )
                        console.log(this.state.data)
                    })
            }
        )
    }

    async fetchGet(url) {
        return window.fetch(url)
            .then(res => res.json())
    }

    async getTokenIds() {
        return await this.contract.tokensOf(this.address).call(
            {
                from: this.address
            })
    }

    async getMetaData(tokenId) {
        return await this.contract.uri(tokenId).call({
                from: this.address
            }
        )
    }
}



