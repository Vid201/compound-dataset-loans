export const filterCTokens = (cTokens, symbol) => {
    for (let i = 0; i < cTokens.length; i++) {
        if (cTokens[i]['underlying_symbol'] === symbol) {
            return cTokens[i];
        }
    }
}
