$(() => {
    // initialize segment
    let seg = Segment.init()
    // create the table of contents
    $('.table-of-contents').html(seg.toc)
    $('body').scrollspy({target: '.table-of-contents'})
    console.log(seg)

    Annotate.init({
        hiddenGlossary: false,
        glossContainer: 'main'
    })
})
