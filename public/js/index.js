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
        videoVM: {
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
            fetch('/videos/page/'+this.pagination.currentPage+'?tags='+this.selectedTags.join(','))
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                this.items = data;
            });
        },

        splitTags(tags) {
            if (!tags) return [];
            return tags.split(',');
        },

        _getAllTags() {
            fetch('/videos/tags/')
            .then(res => res.json())
            .then(data => {
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
            if (!this.videoVM.url) return '';
            let str = this.videoVM.url.split('/').slice(-1)[0];
            this.videoVM.name = str.replaceAll('_', ' ').split(' ').map(word => word.replace(/\w/, c => c.toUpperCase())).join(' ');
        },

        saveItem() {
            this.videoVM.rate = parseInt(this.videoVM.rate);
            if (this.videoVM.id == 0) {
                this._createItem(this.videoVM);
            }
            else {
                this._updateItem(this.videoVM.id, this.videoVM);
                this._resetFormItem();
                this._hideFormModal();
            }
        },

        _createItem(item) {
            fetch('videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item),
            })
            .then(res => res.json())
            .then(data => {
                if (data.id != 0) {
                    this._resetFormItem();
                    this.getItemsByCurrentPage();
                    toastr.success('Create new Item Sucessfully');
                }
            })
            .catch(function(error) {
                console.error('There was a problem with the Fetch request: ', error.message);
                toastr.error(error.message);
            });
        },

        _resetFormItem() {
            this.videoVM = {
                id: 0,
                name: '',
                url: '',
                photo: '',
                tags: '',
                rate: 3,
                model: ''
            };
        },

        updateItemRate(item, newRate) {
            if (!item.rate){
                item["rate"] = newRate;
            }
            else {
                if (item.rate == newRate){
                    return false;
                }
                item.rate = newRate;
            }
            console.log(item);
            this.$forceUpdate();
            this._updateItem(item.id, { rate: newRate });
        },

        showVideoOnModal(item) {
            this.videoVM.id = item.id;
            this.videoVM.name = item.name;
            this.videoVM.url = item.url;
            this.videoVM.photo = item.photo;
            this.videoVM.tags = item.tags;
            this.videoVM.rate = item.rate;
            this.videoVM.model = item.model;

            this._showFormModal();
        },

        _updateItem(id, objPropsValues) {
            fetch('videos/'+id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objPropsValues),
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                this.getItemsByCurrentPage();
                toastr.info('Update Success');
            })
            .catch(function(error) {
                console.error('There was a problem with the Fetch request: ', error.message);
                toastr.error(error.message);
            });
        },

        removeVideo(item) {
            const result = confirm('Ara you sure do you want delete Video?');
            if (result) {
                this._deleteItem(item.id);
            }
        },

        _deleteItem(id) {
            fetch('videos/'+id, {
                method: 'DELETE',
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                this.getItemsByCurrentPage();
                toastr.warning("Delete item Sucessfully");
            })
            .catch(function(error) {
                console.error('There was a problem with the Fetch request: ', error.message);
                toastr.error(error.message);
            });
        },

        _showFormModal() {
            document.getElementById("modal-js-video").classList.add("is-active");
        },

        _hideFormModal() {
            document.getElementById("modal-js-video").classList.remove('is-active');
        },

        IsTagSelected(tag) {
            return this.selectedTags.some(x => x == tag);
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
