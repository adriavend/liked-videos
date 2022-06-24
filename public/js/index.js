const app = new Vue({
    el: '#app',
    data: {
        items: [],
        pagination: {
            goToPages: [],
            total: 0,
            currentPage: 1,
            pageSize: 12
        },
        allTags: [],
        selectedTags: [],
        newItem: {
            id: 0,
            name: '',
            url: '',
            photo: '',
            tags: '',
            rate: 3,
            model: ''
        }
    },
    methods: {
        previous() {
            if (this.pagination.currentPage == 1) {
                return;
            }
            this.pagination.currentPage -= 1;
            this.goToPage(this.pagination.currentPage);
        },

        next() {
            if (this.pagination.currentPage == this.pagination.goToPages.length) {
                return;
            }
            this.pagination.currentPage += 1;
            this.goToPage(this.pagination.currentPage);
        },

        _generateGoToPage() {
            let goToLength;
            if (this.pagination.pageSize >= this.pagination.total) {
                goToLength = 1;
            }
            else {
                goToLength = Math.floor(this.pagination.total / this.pagination.pageSize) +
                    ((this.pagination.total % this.pagination.pageSize) > 0 ? 1 : 0);
            }

            for (let index = 1; index < goToLength + 1; index++) {
                this.pagination.goToPages.push({
                    page: index,
                    isCurrent: index == this.pagination.currentPage
                });
            }
        },

        goToPage(page) {
            // update currentPage
            this.pagination.currentPage = page;

            // updateGoToPage object
            this.pagination.goToPages.forEach((value, index) => {
                value.isCurrent = value.page == this.pagination.currentPage;
            });

            this.getItemsByCurrentPage();
        },

        getItemsByCurrentPage() {
            fetch('/videos/page/'+this.pagination.currentPage+'?tags='+this.selectedTags.join(',')).then(res => res.json()).then(data => {
                // console.log(data);
                this.items = data;
            });
        },

        splitTags(tags) {
            if (!tags) return [];
            return tags.split(',');
        },

        _getAllTags() {
            fetch('/videos/tags/').then(res => res.json()).then(data => {
                this.allTags = data;
            });
        },

        cleanTags() {
            this.selectedTags = [];
            this.pagination.currentPage = 1;
            this.getItemsByCurrentPage();
        },

        async _getVideosCount() {
            fetch('/videos/count/')
            .then(res => res.json())
            .then(data => {
                this.pagination.total = data;
                this._generateGoToPage();
            });
        },

        getNameFromNewItemUrl() {
            if (!this.newItem.url) return '';
            let str = this.newItem.url.split('/').slice(-1)[0];
            this.newItem.name = str.replaceAll('_', ' ').split(' ').map(word => word.replace(/\w/, c => c.toUpperCase())).join(' ');
        },

        saveItem() {
            this.newItem.rate = parseInt(this.newItem.rate);
            fetch('videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.newItem),
            })
            .then(res => res.json())
            .then(data => {
                if (data.id != 0) {
                    this.newItem = {
                        id: 0,
                        name: '',
                        url: '',
                        photo: '',
                        tags: '',
                        rate: 3,
                        model: ''
                    };
                    this.getItemsByCurrentPage();
                }
            });
        }
    },
    created: async function () {
        //this.pagination.total = itemsDb.length;
        await this._getVideosCount();

        //this._generateGoToPage();
        this.getItemsByCurrentPage();

        this._getAllTags();
    },
    filters: {
    },
    computed: {
    },
    watch: {
    }
});
