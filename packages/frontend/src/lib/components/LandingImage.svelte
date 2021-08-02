<script>
    export let src;
    export let alt;
    export let title;
</script>
<div class="lg:grid grid-cols-3 w-2/3 m-auto mb-20">
    <img src={src} alt={alt} class="h-auto w-max col-start-2 col-end-4 rounded-md"/>
    <div class="col-start-1 col-end-2 row-start-1">
        <h1 class="text-xl font-bold lg:mt-30">{title}</h1>
        <p><slot></slot></p>
    </div>
</div>