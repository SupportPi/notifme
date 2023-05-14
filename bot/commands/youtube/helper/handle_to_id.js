// Converts handles to ids
module.exports = async (handle) => {
        const result = {
            channelId: null,
            handle: null,
        } 
        if(handle.contains(`@`)) result.handle = handle.replace("@", "");
        else result.handle = handle;

        try {
            let res = await fetch(`https://yt.lemnoslife.com/channels?handle=@${result.handle}`);
            let parsed = await JSON.parse(res);
            result.channelId = res.items[0]?.id;
            console.log(result.channelId);
        } catch (err) {
            console.log(err);
        }
        return result;
}