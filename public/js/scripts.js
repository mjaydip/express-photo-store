$(function(){
    $('#post-comment').hide();
    $('#btn-comment').on('click', function(event) {
        event.preventDefault();

        $('#post-comment').slideDown();
    });

    $('#btn-like').on('click', function(event) {
        event.preventDefault();

        var imgId = $(this).data('id');

        $.post('/images/' + imgId + '/like').done(function(data) {
            $('.likes-count').text(data.likes);
        });
    });

    $('#btn-delete').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var imgId = $(this).data('id');

        $.ajax({
            url: '/images/' + imgId,
            type: 'DELETE'
        }).done(function(result) {
            if (result) {
                window.location.replace('/');
            }
        });
    });

    $('#login-btn').click(function(){
        $(this).html('<i class="fa fa-spinner fa-spin"></i> Uploading Image...');
    });
});
