let seg = Segment.init()
$(() => {
    $(seg.toc).attr('id', 'page-contents').addClass('collapse in')
    $('.toc').append(seg.toc)
})
