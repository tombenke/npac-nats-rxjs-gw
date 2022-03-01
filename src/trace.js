import _ from 'lodash'

export const printJson = (label, data, spaces = 0) =>
    spaces > 0
        ? console.log(`${label}: ${JSON.stringify(data, null, _.times(spaces, _.constant(' ')).join(''))}`)
        : console.log(`${label}: ${JSON.stringify(data)}`)

export const printMsg = (label) => (it) => {
    console.log(`\n[${label}]`)
    switch (_.get(it, 'type', '')) {
        default:
            console.log('...', JSON.stringify(it))
            break
    }
}

export const print = (label) => (it) => console.log(`\n[${label}]\n${JSON.stringify(it)}`)

export const tee = (fun) => (it) => {
    fun(it)
    return it
}
